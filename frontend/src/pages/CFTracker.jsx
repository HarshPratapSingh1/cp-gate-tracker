import { useState, useEffect } from "react";
import axios from "axios";
import { db, auth } from "../firebase/config";
import {
    doc,
    setDoc,
    arrayUnion,
    getDoc
} from "firebase/firestore";

import RatingChart from "../components/RatingChart";

function CFTracker() {

    const [handle, setHandle] = useState("");
    const [rating, setRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [contestHistory, setContestHistory] = useState([]);

    const [solvedStats, setSolvedStats] = useState({
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0
    });

    const [tagStats, setTagStats] = useState({});
    const [accuracy, setAccuracy] = useState(0);

    // 📊 Computed Dashboard Stats
    const currentRating =
        history.length > 0 ? history[history.length - 1].rating : 0;

    const peakRating =
        history.length > 0
            ? Math.max(...history.map(item => item.rating))
            : 0;

    const expertProgress =
        currentRating > 0
            ? Math.min((currentRating / 1600) * 100, 100).toFixed(1)
            : 0;

    // Weekly improvement
    let weeklyGain = 0;

    if (history.length >= 2) {
        const last = history[history.length - 1].rating;
        const prev = history[Math.max(history.length - 8, 0)].rating;
        weeklyGain = last - prev;
    }

    // Weakest topic
    let weakestTopic = "N/A";

    if (Object.keys(tagStats).length > 0) {
        weakestTopic = Object.entries(tagStats)
            .sort((a, b) => a[1] - b[1])[0][0];
    }

    // Load saved history
    useEffect(() => {

        const loadHistory = async () => {

            if (!auth.currentUser) return;

            try {
                const ref = doc(db, "cfRatings", auth.currentUser.uid);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();
                    setHistory(data.history || []);
                    setHandle(data.handle || "");
                }

            } catch (err) {
                console.log("History load error:", err);
            }
        };

        loadHistory();

    }, []);

    const fetchRating = async () => {

        if (!auth.currentUser) {
            alert("User not authenticated");
            return;
        }

        if (!handle.trim()) {
            alert("Enter Codeforces handle");
            return;
        }

        try {
            setLoading(true);

            // 🔥 Fetch rating
            const res = await axios.get(
                `https://codeforces.com/api/user.info?handles=${handle.trim()}`
            );

            const userRating = res.data.result[0].rating || 0;
            setRating(userRating);

            const ref = doc(db, "cfRatings", auth.currentUser.uid);

            await setDoc(ref, {
                handle: handle.trim()
            }, { merge: true });

            await setDoc(ref, {
                history: arrayUnion({
                    rating: userRating,
                    date: new Date()
                })
            }, { merge: true });

            setHistory(prev => [
                ...prev,
                { rating: userRating, date: new Date() }
            ]);

            // 🔥 Fetch submissions
            const subRes = await axios.get(
                `https://codeforces.com/api/user.status?handle=${handle.trim()}`
            );

            const submissions = subRes.data.result;

            const solvedSet = new Set();
            const tagCount = {};

            let accepted = 0;
            let total = submissions.length;

            let easy = 0;
            let medium = 0;
            let hard = 0;

            submissions.forEach(sub => {

                if (sub.verdict === "OK") {

                    accepted++;

                    const key = sub.problem.contestId + "-" + sub.problem.index;

                    if (!solvedSet.has(key)) {

                        solvedSet.add(key);

                        const rating = sub.problem.rating || 0;

                        if (rating > 0 && rating < 1200) easy++;
                        else if (rating >= 1200 && rating < 1800) medium++;
                        else if (rating >= 1800) hard++;

                        // Tag counting
                        sub.problem.tags.forEach(tag => {
                            tagCount[tag] = (tagCount[tag] || 0) + 1;
                        });
                    }
                }
            });

            const acc = ((accepted / total) * 100).toFixed(1);

            setAccuracy(acc);

            setSolvedStats({
                total: solvedSet.size,
                easy,
                medium,
                hard
            });

            setTagStats(tagCount);

            // 🔥 Fetch contest history
            const contestRes = await axios.get(
                `https://codeforces.com/api/user.rating?handle=${handle.trim()}`
            );

            setContestHistory(contestRes.data.result.slice(-10));

        } catch (error) {
            alert("Invalid Codeforces handle");
        }

        setLoading(false);
    };

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                Codeforces Tracker
            </h1>

            {/* 📊 DASHBOARD */}
            <div className="grid grid-cols-9 gap-4 mb-6">

                <div className="bg-blue-100 p-4 rounded shadow">
                    <p className="text-sm">Current</p>
                    <p className="text-xl font-bold">{currentRating}</p>
                </div>

                <div className="bg-green-100 p-4 rounded shadow">
                    <p className="text-sm">Peak</p>
                    <p className="text-xl font-bold">{peakRating}</p>
                </div>

                <div className="bg-purple-100 p-4 rounded shadow">
                    <p className="text-sm">Expert %</p>
                    <p className="text-xl font-bold">{expertProgress}%</p>
                </div>

                <div className="bg-yellow-100 p-4 rounded shadow">
                    <p className="text-sm">Weekly</p>
                    <p className="text-xl font-bold">
                        {weeklyGain >= 0 ? "▲ " : "▼ "}
                        {weeklyGain}
                    </p>
                </div>

                <div className="bg-indigo-100 p-4 rounded shadow">
                    <p className="text-sm">Solved</p>
                    <p className="text-xl font-bold">{solvedStats.total}</p>
                </div>

                <div className="bg-green-200 p-4 rounded shadow">
                    <p className="text-sm">Easy</p>
                    <p className="text-xl font-bold">{solvedStats.easy}</p>
                </div>

                <div className="bg-yellow-200 p-4 rounded shadow">
                    <p className="text-sm">Medium</p>
                    <p className="text-xl font-bold">{solvedStats.medium}</p>
                </div>

                <div className="bg-red-200 p-4 rounded shadow">
                    <p className="text-sm">Accuracy</p>
                    <p className="text-xl font-bold">{accuracy}%</p>
                </div>

                <div className="bg-orange-200 p-4 rounded shadow">
                    <p className="text-sm">Weak Topic</p>
                    <p className="text-sm font-bold">{weakestTopic}</p>
                </div>

            </div>

            {/* INPUT */}
            <div className="flex items-center gap-3">

                <input
                    type="text"
                    placeholder="Enter CF handle"
                    className="border p-2 rounded"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                />

                <button
                    onClick={fetchRating}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Fetching..." : "Fetch Rating"}
                </button>

            </div>

            {rating !== null && (
                <p className="mt-4 text-lg">
                    Current Rating: <b>{rating}</b>
                </p>
            )}

            {/* GRAPH */}
            {history.length > 0 && (
                <div className="bg-gray-900 p-6 rounded-xl mt-6 shadow-lg">
                    <RatingChart history={history} />
                </div>
            )}

            {/* CONTEST TABLE */}
            {contestHistory.length > 0 && (
                <div className="mt-8">

                    <h2 className="text-xl font-bold mb-4">
                        Recent Contest Performance
                    </h2>

                    <table className="w-full border">

                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2">Contest</th>
                                <th className="p-2">Rank</th>
                                <th className="p-2">Δ Rating</th>
                            </tr>
                        </thead>

                        <tbody>
                            {contestHistory.map((c, index) => (
                                <tr key={index} className="text-center border-t">

                                    <td className="p-2">{c.contestName}</td>
                                    <td className="p-2">{c.rank}</td>

                                    <td
                                        className={`p-2 font-bold ${c.newRating - c.oldRating >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {c.newRating - c.oldRating}
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}

export default CFTracker;

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

    // Weekly improvement calculation (last 7 entries approx)
    let weeklyGain = 0;

    if (history.length >= 2) {
        const last = history[history.length - 1].rating;
        const prev = history[Math.max(history.length - 8, 0)].rating;
        weeklyGain = last - prev;
    }


    // Load rating history on page load
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

            const res = await axios.get(
                `https://codeforces.com/api/user.info?handles=${handle.trim()}`
            );

            const userRating = res.data.result[0].rating || 0;

            setRating(userRating);

            const ref = doc(db, "cfRatings", auth.currentUser.uid);

            // Save handle
            await setDoc(ref, {
                handle: handle.trim()
            }, { merge: true });

            // Save rating history
            await setDoc(ref, {
                history: arrayUnion({
                    rating: userRating,
                    date: new Date()
                })
            }, { merge: true });

            // Update UI instantly
            setHistory(prev => [
                ...prev,
                { rating: userRating, date: new Date() }
            ]);

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

            {/* 📊 DASHBOARD CARDS */}
            <div className="grid grid-cols-4 gap-4 mb-6">

                <div className="bg-blue-100 p-4 rounded shadow">
                    <p className="text-sm">Current Rating</p>
                    <p className="text-xl font-bold">{currentRating}</p>
                </div>

                <div className="bg-green-100 p-4 rounded shadow">
                    <p className="text-sm">Peak Rating</p>
                    <p className="text-xl font-bold">{peakRating}</p>
                </div>

                <div className="bg-purple-100 p-4 rounded shadow">
                    <p className="text-sm">Expert Progress</p>
                    <p className="text-xl font-bold">{expertProgress}%</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded shadow">
                    <p className="text-sm">Weekly Progress</p>

                    <p className="text-xl font-bold">
                        {weeklyGain >= 0 ? "▲ " : "▼ "}
                        {weeklyGain}
                    </p>
                </div>

            </div>

            {/* INPUT SECTION */}
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

            {/* 📈 GRAPH */}
            {history.length > 0 && (
                <div className="bg-gray-900 p-6 rounded-xl mt-6 shadow-lg">
                    <RatingChart history={history} />
                </div>
            )}

        </div>
    );
}

export default CFTracker;

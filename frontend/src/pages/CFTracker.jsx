import { useState, useEffect } from "react";
import axios from "axios";
import { db, auth } from "../firebase/config";
import {
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    getDoc
} from "firebase/firestore";

import RatingChart from "../components/RatingChart";

function CFTracker() {

    const [handle, setHandle] = useState("");
    const [rating, setRating] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

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

            // Save handle safely
            await setDoc(ref, {
                handle: handle.trim()
            }, { merge: true });

            // Add rating history safely
            await setDoc(ref, {
                history: arrayUnion({
                    rating: userRating,
                    date: new Date()
                })
            }, { merge: true });

            // Update UI instantly (no extra fetch needed)
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

            {history.length > 0 && (
                <div className="bg-gray-900 p-6 rounded-xl mt-6 shadow-lg">
                    <RatingChart history={history} />
                </div>
            )}

        </div>
    );
}

export default CFTracker;

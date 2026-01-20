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
                    setHistory(snap.data().history || []);
                    setHandle(snap.data().handle || "");
                }

            } catch (err) {
                console.log("History load error", err);
            }
        };

        loadHistory();

    }, []);

    const fetchRating = async () => {

        if (!auth.currentUser) {
            alert("User not authenticated");
            return;
        }

        try {
            setLoading(true);

            const res = await axios.get(
                `https://codeforces.com/api/user.info?handles=${handle}`
            );

            const userRating = res.data.result[0].rating || 0;

            setRating(userRating);

            const ref = doc(db, "cfRatings", auth.currentUser.uid);

            // Save handle
            await setDoc(ref, {
                handle: handle
            }, { merge: true });

            // Push rating history
            await updateDoc(ref, {
                history: arrayUnion({
                    rating: userRating,
                    date: new Date()
                })
            });

            // Reload updated history
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setHistory(snap.data().history || []);
            }

            setLoading(false);

        } catch (error) {
            alert("Invalid Codeforces handle");
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">
                Codeforces Tracker
            </h1>

            <input
                type="text"
                placeholder="Enter CF handle"
                className="border p-2 mr-2"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
            />

            <button
                onClick={fetchRating}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Fetch Rating
            </button>

            {loading && (
                <p className="mt-3">Loading...</p>
            )}

            {rating && (
                <p className="mt-4 text-lg">
                    Current Rating: <b>{rating}</b>
                </p>
            )}

            {history.length > 0 && (
                <div className="mt-6">
                    <RatingChart history={history} />
                </div>
            )}

        </div>
    );
}

export default CFTracker;

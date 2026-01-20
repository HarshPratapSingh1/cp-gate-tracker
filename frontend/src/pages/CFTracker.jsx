import { useState } from "react";
import axios from "axios";
import { db, auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

function CFTracker() {

    const [handle, setHandle] = useState("");
    const [rating, setRating] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRating = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `https://codeforces.com/api/user.info?handles=${handle}`
            );

            const userRating = res.data.result[0].rating || 0;

            setRating(userRating);

            // Save to Firestore
            await setDoc(doc(db, "cfRatings", auth.currentUser.uid), {
                handle: handle,
                rating: userRating,
                updatedAt: new Date()
            });

            setLoading(false);

        } catch (error) {
            alert("Invalid Codeforces handle");
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Codeforces Tracker</h1>

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

            {loading && <p className="mt-3">Loading...</p>}

            {rating && (
                <p className="mt-4 text-lg">
                    Current Rating: <b>{rating}</b>
                </p>
            )}
        </div>
    );
}

export default CFTracker

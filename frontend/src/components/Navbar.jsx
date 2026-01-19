import { Link } from "react-router-dom";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

function Navbar() {

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between">
            <div className="flex gap-6">
                <Link to="/">Dashboard</Link>
                <Link to="/cf">CF Tracker</Link>
                <Link to="/gate">GATE Tracker</Link>
            </div>

            <button onClick={handleLogout} className="text-red-400">
                Logout
            </button>
        </nav>
    );
}

export default Navbar;

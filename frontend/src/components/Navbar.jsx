import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="bg-gray-800 text-white px-6 py-4 flex gap-6">
            <Link to="/" className="hover:text-pink-400">Dashboard</Link>
            <Link to="/cf" className="hover:text-pink-400">CF Tracker</Link>
            <Link to="/gate" className="hover:text-pink-400">GATE Tracker</Link>
        </nav>
    );
}

export default Navbar;

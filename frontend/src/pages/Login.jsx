import { auth } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Login() {

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <button
                onClick={handleLogin}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg"
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default Login;

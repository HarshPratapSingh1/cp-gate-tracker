import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "./firebase/config";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CFTracker from "./pages/CFTracker";
import GateTracker from "./pages/GateTracker";
import Login from "./pages/Login";

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cf" element={<CFTracker />} />
          <Route path="/gate" element={<GateTracker />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

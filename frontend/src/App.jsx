import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CFTracker from "./pages/CFTracker";
import GateTracker from "./pages/GateTracker";

function App() {
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

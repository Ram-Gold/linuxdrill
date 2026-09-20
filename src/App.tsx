import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ProblemPage from "./pages/ProblemPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4">
        <Link to="/" className="text-xl font-bold">LinuxDrill</Link>
      </header>
      <main className="mx-auto max-w-3xl p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<ProblemPage />} />
        </Routes>
      </main>
    </div>
  );
}

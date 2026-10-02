if (import.meta.env.DEV) {
  import("react-grab");
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import ProblemPage from "./pages/ProblemPage";
import TerminalPlayground from "./pages/TerminalPlayground";
import DrillsPage from "./pages/DrillsPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "p/:id", element: <ProblemPage /> },
      { path: "terminal", element: <TerminalPlayground /> },
      { path: "drills", element: <DrillsPage /> },
      { path: "typing", element: <Navigate to="/drills" replace /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);


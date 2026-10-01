import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;
const criticalShell = document.getElementById("critical-shell");
createRoot(root).render(<App />);
window.requestAnimationFrame(() => criticalShell?.remove());

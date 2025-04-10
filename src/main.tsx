import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Timeline from "./components/Timeline";
import timelineItems from "./lib/timelineItems";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Timeline View</h1>
      <Timeline items={timelineItems} />
    </main>
  </StrictMode>
);

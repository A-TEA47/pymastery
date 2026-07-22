"use client";

import { useState } from "react";
import Link from "next/link";
import ProblemCard from "@/components/Problems/ProblemCard";
import type { Problem } from "@/lib/content";

interface ChallengesClientProps {
  level: string;
  problems: Problem[];
}

export default function ChallengesClient({ level, problems }: ChallengesClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);

  const levelTitles: Record<string, string> = {
    beginner: "Level 1 — Beginner Boss Set 🏆",
    intermediate: "Level 2 — Intermediate Boss Set 🏆",
    advanced: "Level 3 — Advanced Boss Set 🏆",
    expert: "Expert Challenge Set 🏆",
  };

  const toggleTimer = () => {
    if (timerActive) {
      if (timerRef) clearInterval(timerRef);
      setTimerActive(false);
    } else {
      const ref = setInterval(() => setElapsed((e) => e + 1), 1000);
      setTimerRef(ref);
      setTimerActive(true);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }} className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <Link href="/curriculum" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>Curriculum</Link>
          <span>›</span>
          <span>Challenges</span>
          <span>›</span>
          <span style={{ textTransform: "capitalize" }}>{level}</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: "900", marginBottom: "8px" }}>
          {levelTitles[level] || `${level} Challenge Set`}
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {problems.length} challenge problems. Solve them in any order. Timer is optional.
        </p>
      </div>

      {/* Timer */}
      <div
        className="card"
        style={{ padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px" }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Optional Timer
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              fontFamily: "JetBrains Mono, monospace",
              color: timerActive ? "var(--accent-orange)" : "var(--text-secondary)",
              transition: "color 0.3s",
            }}
          >
            {formatTime(elapsed)}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className={timerActive ? "btn-secondary" : "btn-primary"} onClick={toggleTimer} style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
            {timerActive ? "⏸ Pause" : "▶ Start Timer"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => { setElapsed(0); if (timerRef) clearInterval(timerRef); setTimerActive(false); }}
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* Problem navigator */}
      {problems.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {problems.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveIdx(i)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                background: i === activeIdx ? "rgba(79,142,247,0.2)" : "var(--bg-card)",
                border: `1px solid ${i === activeIdx ? "var(--accent-blue)" : "var(--border)"}`,
                color: i === activeIdx ? "var(--accent-blue)" : "var(--text-secondary)",
                fontWeight: i === activeIdx ? "700" : "500",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Problem {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Problem */}
      {problems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-lg)" }}>
          No challenge problems found for this level yet. Check back soon!
        </div>
      ) : (
        <ProblemCard
          key={problems[activeIdx]?.id}
          problem={problems[activeIdx]}
          conceptId={problems[activeIdx]?.concept_ids?.[0] || ""}
        />
      )}

      {/* Navigation */}
      {problems.length > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          <button
            className="btn-secondary"
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            disabled={activeIdx === 0}
            style={{ padding: "10px 20px" }}
          >
            ← Previous
          </button>
          <button
            className="btn-primary"
            onClick={() => setActiveIdx((i) => Math.min(problems.length - 1, i + 1))}
            disabled={activeIdx === problems.length - 1}
            style={{ padding: "10px 20px" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

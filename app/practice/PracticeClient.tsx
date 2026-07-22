"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Problem } from "@/lib/content";

interface PracticeClientProps {
  problems: Problem[];
}

export default function PracticeClient({ problems }: PracticeClientProps) {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"difficulty" | "level" | "tier">("difficulty");

  const filtered = useMemo(() => {
    let result = problems;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterLevel !== "all") result = result.filter((p) => p.level === filterLevel);
    if (filterTier !== "all") result = result.filter((p) => p.tier === filterTier);

    result = [...result].sort((a, b) => {
      if (sortBy === "difficulty") return a.difficulty - b.difficulty;
      if (sortBy === "level") {
        const order = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
        return order[a.level] - order[b.level];
      }
      if (sortBy === "tier") {
        const order = { warmup: 0, applied: 1, challenge: 2 };
        return order[a.tier] - order[b.tier];
      }
      return 0;
    });

    return result;
  }, [problems, search, filterLevel, filterTier, sortBy]);

  const tierIcon: Record<string, string> = { warmup: "🟢", applied: "🔵", challenge: "🔥" };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fade-in" style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.2rem)", fontWeight: "900", marginBottom: "8px" }}>
          ⚡ Practice Problems
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {problems.length} problems across all levels. Filter, search, and solve.
        </p>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search problems…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1",
            minWidth: "200px",
            padding: "10px 16px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          style={{ padding: "10px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer" }}
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>

        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          style={{ padding: "10px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer" }}
        >
          <option value="all">All Tiers</option>
          <option value="warmup">🟢 Warm-up</option>
          <option value="applied">🔵 Applied</option>
          <option value="challenge">🔥 Challenge</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "difficulty" | "level" | "tier")}
          style={{ padding: "10px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer" }}
        >
          <option value="difficulty">Sort: Difficulty</option>
          <option value="level">Sort: Level</option>
          <option value="tier">Sort: Tier</option>
        </select>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
        Showing {filtered.length} of {problems.length} problems
      </p>

      {/* Problem list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            No problems match your filters. Try adjusting them.
          </div>
        )}
        {filtered.map((problem) => (
          <Link
            key={problem.id}
            href={`/practice/${problem.id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              className="card"
              style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  width: "36px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {tierIcon[problem.tier]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span className={`badge badge-${problem.level}`}>{problem.level}</span>
                  <span className={`badge badge-${problem.tier}`}>{problem.tier}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>{problem.title}</h3>
                <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {problem.prompt.slice(0, 100)}…
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px" }}>Difficulty</div>
                <div style={{ fontWeight: "700", color: problem.difficulty <= 3 ? "var(--accent-green)" : problem.difficulty <= 6 ? "var(--accent-yellow)" : "var(--accent-red)" }}>
                  {"★".repeat(Math.min(problem.difficulty, 5))}
                </div>
              </div>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTotalStats, getStreakCalendar, getAllProgress } from "@/lib/db";
import type { CurriculumLevel } from "@/lib/content";

interface DashboardClientProps {
  curriculum: CurriculumLevel[];
}

export default function DashboardClient({ curriculum }: DashboardClientProps) {
  const [stats, setStats] = useState({ conceptsCompleted: 0, problemsSolved: 0, currentStreak: 0, totalXP: 0 });
  const [calendar, setCalendar] = useState<{ date: string; count: number }[]>([]);
  const [lastConcept, setLastConcept] = useState<{ level: string; module: string; id: string; title: string } | null>(null);

  useEffect(() => {
    getTotalStats().then(setStats);
    getStreakCalendar(30).then(setCalendar);

    // Find last attempted concept
    getAllProgress().then((progress) => {
      if (progress.length === 0) return;
      const last = progress.sort((a, b) => b.lastAttemptAt - a.lastAttemptAt)[0];
      // Find this concept in curriculum
      for (const level of curriculum) {
        for (const mod of level.modules) {
          const found = mod.concepts.find((c) => c.id === last.conceptId);
          if (found) {
            setLastConcept({ level: found.level, module: found.module, id: found.id, title: found.title });
            break;
          }
        }
      }
    });
  }, [curriculum]);

  const totalConcepts = curriculum.reduce((sum, l) => sum + l.modules.reduce((s, m) => s + m.concepts.length, 0), 0);
  const progressPct = totalConcepts > 0 ? Math.round((stats.conceptsCompleted / totalConcepts) * 100) : 0;

  // First concept
  const firstConcept = curriculum[0]?.modules[0]?.concepts[0];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Hero */}
      <div className="animate-fade-in" style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: "900",
                marginBottom: "12px",
                background: "var(--gradient-hero)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Welcome to PyMastery 🐍
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "560px", lineHeight: "1.7" }}>
              Your personal Python learning journey — from absolute beginner to interview-ready. Write code, get instant feedback, and level up.
            </p>
          </div>

          {/* Streak */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 28px",
              textAlign: "center",
              minWidth: "130px",
              boxShadow: "0 0 20px rgba(249, 115, 22, 0.1)",
            }}
          >
            <div className="streak-flame" style={{ fontSize: "2.5rem", fontWeight: "900", lineHeight: "1" }}>
              🔥 {stats.currentStreak}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: "600" }}>
              DAY STREAK
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
        className="animate-fade-in"
      >
        {[
          { label: "Concepts Learned", value: `${stats.conceptsCompleted}/${totalConcepts}`, icon: "📚", color: "var(--accent-blue)" },
          { label: "Problems Solved", value: stats.problemsSolved, icon: "⚡", color: "var(--accent-green)" },
          { label: "Total XP", value: stats.totalXP.toLocaleString(), icon: "✨", color: "var(--accent-purple)" },
          { label: "Day Streak", value: stats.currentStreak, icon: "🔥", color: "var(--accent-orange)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ padding: "20px 24px" }}
          >
            <div style={{ fontSize: "1.6rem", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: stat.color, lineHeight: "1" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: "24px", marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700" }}>Overall Progress</h3>
          <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-blue)" }}>{progressPct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p style={{ margin: "10px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {stats.conceptsCompleted} of {totalConcepts} concepts completed
        </p>
      </div>

      {/* Activity calendar */}
      {calendar.some((d) => d.count > 0) && (
        <div className="card" style={{ padding: "24px", marginBottom: "40px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: "700" }}>Activity — Last 30 Days</h3>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {calendar.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} activities`}
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "3px",
                  background: day.count === 0
                    ? "var(--bg-secondary)"
                    : day.count < 3
                    ? "rgba(79, 142, 247, 0.4)"
                    : day.count < 6
                    ? "rgba(79, 142, 247, 0.7)"
                    : "var(--accent-blue)",
                  transition: "background 0.2s",
                  cursor: "default",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "48px" }}>
        {lastConcept ? (
          <Link
            href={`/learn/${lastConcept.level}/${lastConcept.module}/${lastConcept.id}`}
            className="btn-primary"
            style={{ textDecoration: "none", fontSize: "1rem", padding: "14px 28px" }}
          >
            ▶ Continue: {lastConcept.title}
          </Link>
        ) : firstConcept ? (
          <Link
            href={`/learn/${firstConcept.level}/${firstConcept.module}/${firstConcept.id}`}
            className="btn-primary"
            style={{ textDecoration: "none", fontSize: "1rem", padding: "14px 28px" }}
          >
            🚀 Start Learning
          </Link>
        ) : null}

        <Link href="/curriculum" className="btn-secondary" style={{ textDecoration: "none", fontSize: "1rem", padding: "14px 28px" }}>
          📚 View Curriculum
        </Link>
        <Link href="/playground" className="btn-secondary" style={{ textDecoration: "none", fontSize: "1rem", padding: "14px 28px" }}>
          🎮 Open Playground
        </Link>
      </div>

      {/* Curriculum preview */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "24px" }}>
          The Curriculum
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {curriculum.map((level) => {
            const totalInLevel = level.modules.reduce((s, m) => s + m.concepts.length, 0);
            const levelColors: Record<string, string> = {
              beginner: "var(--accent-green)",
              intermediate: "var(--accent-blue)",
              advanced: "var(--accent-purple)",
              expert: "var(--accent-orange)",
            };
            const color = levelColors[level.id] || "var(--accent-blue)";
            return (
              <div
                key={level.id}
                className="card"
                style={{ padding: "20px 24px", background: `linear-gradient(145deg, rgba(${level.id === "beginner" ? "16,217,138" : level.id === "intermediate" ? "79,142,247" : level.id === "advanced" ? "139,92,246" : "249,115,22"}, 0.05) 0%, var(--bg-card) 100%)` }}
              >
                <div style={{ color, fontWeight: "700", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  {level.title.split("—")[0].trim()}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem" }}>{level.title.split("—")[1]?.trim() || level.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 16px", lineHeight: "1.5" }}>
                  {level.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{totalInLevel} concepts</span>
                  <Link
                    href="/curriculum"
                    style={{ fontSize: "0.85rem", color, textDecoration: "none", fontWeight: "600" }}
                  >
                    Explore →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

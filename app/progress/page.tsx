"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTotalStats, getStreakCalendar, getAllProgress } from "@/lib/db";
import type { Metadata } from "next";

export default function ProgressPage() {
  const [stats, setStats] = useState({ conceptsCompleted: 0, problemsSolved: 0, currentStreak: 0, totalXP: 0 });
  const [calendar, setCalendar] = useState<{ date: string; count: number }[]>([]);
  const [progress, setProgress] = useState<{ conceptId: string; masteryScore: number; completed: boolean; warmupPassed: boolean; appliedPassed: boolean; challengePassed: boolean }[]>([]);

  useEffect(() => {
    getTotalStats().then(setStats);
    getStreakCalendar(90).then(setCalendar);
    getAllProgress().then(setProgress);
  }, []);

  const weeklyCalendar = calendar.slice(-91);

  // Group calendar into weeks
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < weeklyCalendar.length; i += 7) {
    weeks.push(weeklyCalendar.slice(i, i + 7));
  }

  const weakConcepts = progress.filter((p) => !p.challengePassed && (p.warmupPassed || p.appliedPassed));

  const xpLevel = Math.floor(stats.totalXP / 500) + 1;
  const xpToNext = 500 - (stats.totalXP % 500);

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fade-in" style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: "900", marginBottom: "8px" }}>
          📊 Your Progress
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>Your learning journey at a glance.</p>
      </div>

      {/* XP + Level */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(139,92,246,0.15))",
          border: "1px solid rgba(79,142,247,0.3)",
          borderRadius: "var(--radius-xl)",
          padding: "28px",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
              Current Level
            </div>
            <div style={{ fontSize: "3rem", fontWeight: "900", lineHeight: "1", background: "var(--gradient-hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Level {xpLevel}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
              {stats.totalXP.toLocaleString()} XP · {xpToNext} XP to next level
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="streak-flame" style={{ fontSize: "3rem", fontWeight: "900", lineHeight: "1" }}>
              🔥 {stats.currentStreak}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginTop: "4px" }}>
              DAY STREAK
            </div>
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <div className="progress-bar" style={{ height: "8px" }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${((stats.totalXP % 500) / 500) * 100}%` }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>Level {xpLevel}</span>
            <span>Level {xpLevel + 1}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {[
          { label: "Concepts Learned", value: stats.conceptsCompleted, icon: "📚", color: "var(--accent-blue)" },
          { label: "Problems Solved", value: stats.problemsSolved, icon: "✅", color: "var(--accent-green)" },
          { label: "Best Streak", value: `${stats.currentStreak} days`, icon: "🔥", color: "var(--accent-orange)" },
          { label: "Total XP", value: stats.totalXP.toLocaleString(), icon: "✨", color: "var(--accent-purple)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "20px" }}>
            <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color: s.color, lineHeight: "1.2", marginTop: "8px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="card" style={{ padding: "24px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px" }}>Activity — Last 90 Days</h2>
        <div style={{ display: "flex", gap: "3px", overflowX: "auto", paddingBottom: "8px" }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} activities`}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background:
                      day.count === 0
                        ? "var(--bg-secondary)"
                        : day.count < 2
                        ? "rgba(79,142,247,0.35)"
                        : day.count < 4
                        ? "rgba(79,142,247,0.6)"
                        : day.count < 6
                        ? "rgba(79,142,247,0.85)"
                        : "var(--accent-blue)",
                    transition: "background 0.2s",
                    cursor: "default",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <span>Less</span>
          {[0, 0.35, 0.6, 0.85, 1].map((opacity, i) => (
            <div
              key={i}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                background: i === 0 ? "var(--bg-secondary)" : `rgba(79,142,247,${opacity})`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Concept mastery breakdown */}
      {progress.length > 0 && (
        <div className="card" style={{ padding: "24px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>Concept Mastery</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {progress.map((p) => {
              const score = (Number(p.warmupPassed) + Number(p.appliedPassed) + Number(p.challengePassed)) / 3;
              const pct = Math.round(score * 100);
              return (
                <div key={p.conceptId} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ minWidth: "160px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "capitalize" }}>
                    {p.conceptId.replace(/-/g, " ")}
                  </div>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background:
                          pct === 100
                            ? "var(--gradient-green)"
                            : pct >= 66
                            ? "var(--gradient-blue)"
                            : "var(--gradient-purple)",
                      }}
                    />
                  </div>
                  <div style={{ minWidth: "40px", textAlign: "right", fontSize: "0.8rem", fontWeight: "700", color: pct === 100 ? "var(--accent-green)" : "var(--text-muted)" }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak topics */}
      {weakConcepts.length > 0 && (
        <div
          style={{
            background: "rgba(249,115,22,0.06)",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "var(--accent-orange)" }}>
            💡 Recommended Practice
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "16px" }}>
            You've started these but haven't completed the challenge tier. Keep going!
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {weakConcepts.map((c) => (
              <Link
                key={c.conceptId}
                href={`/curriculum`}
                style={{
                  padding: "6px 16px",
                  borderRadius: "100px",
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  color: "var(--accent-orange)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {c.conceptId.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      )}

      {progress.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1rem", marginBottom: "16px" }}>No progress yet! Start learning to see your stats here.</p>
          <Link href="/curriculum" className="btn-primary" style={{ textDecoration: "none" }}>
            🚀 Start Learning
          </Link>
        </div>
      )}
    </div>
  );
}

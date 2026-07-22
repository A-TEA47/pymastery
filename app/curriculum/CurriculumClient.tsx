"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllProgress } from "@/lib/db";
import type { CurriculumLevel } from "@/lib/content";

interface CurriculumClientProps {
  curriculum: CurriculumLevel[];
}

export default function CurriculumClient({ curriculum }: CurriculumClientProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(["beginner"]));

  useEffect(() => {
    getAllProgress().then((progress) => {
      setCompletedIds(new Set(progress.filter((p) => p.completed).map((p) => p.conceptId)));
    });
  }, []);

  const levelColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    beginner: { bg: "rgba(16,217,138,0.06)", border: "rgba(16,217,138,0.25)", text: "var(--accent-green)", badge: "badge-beginner" },
    intermediate: { bg: "rgba(79,142,247,0.06)", border: "rgba(79,142,247,0.25)", text: "var(--accent-blue)", badge: "badge-intermediate" },
    advanced: { bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.25)", text: "var(--accent-purple)", badge: "badge-advanced" },
    expert: { bg: "rgba(249,115,22,0.06)", border: "rgba(249,115,22,0.25)", text: "var(--accent-orange)", badge: "badge-expert" },
  };

  const toggleLevel = (levelId: string) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fade-in" style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: "900", marginBottom: "12px" }}>
          Full Curriculum 📚
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          4 levels, 50+ concepts, 150+ problems — from print("hello") to interview-ready algorithms.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {curriculum.map((level) => {
          const colors = levelColors[level.id] || levelColors.beginner;
          const totalConcepts = level.modules.reduce((s, m) => s + m.concepts.length, 0);
          const completedInLevel = level.modules.reduce(
            (s, m) => s + m.concepts.filter((c) => completedIds.has(c.id)).length,
            0
          );
          const isExpanded = expandedLevels.has(level.id);

          return (
            <div
              key={level.id}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: "var(--radius-xl)",
                background: colors.bg,
                overflow: "hidden",
              }}
            >
              {/* Level header */}
              <button
                onClick={() => toggleLevel(level.id)}
                style={{
                  width: "100%",
                  padding: "24px 28px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span className={`badge ${colors.badge}`}>{level.id}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {completedInLevel}/{totalConcepts} completed
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {level.title}
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    {level.description}
                  </p>
                </div>

                {/* Progress */}
                <div style={{ textAlign: "right", minWidth: "80px" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: "800", color: colors.text }}>
                    {Math.round((completedInLevel / Math.max(totalConcepts, 1)) * 100)}%
                  </div>
                  <div style={{ fontSize: "1.4rem", marginTop: "4px", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                    ▾
                  </div>
                </div>
              </button>

              {/* Progress bar */}
              <div style={{ padding: "0 28px 16px" }}>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.round((completedInLevel / Math.max(totalConcepts, 1)) * 100)}%`,
                      background: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* Modules */}
              {isExpanded && (
                <div style={{ padding: "0 16px 16px" }} className="animate-fade-in">
                  {level.modules.map((mod) => (
                    <div key={mod.id} style={{ marginBottom: "16px" }}>
                      <h3
                        style={{
                          padding: "8px 12px",
                          margin: "0 0 8px",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          color: colors.text,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {mod.title}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {mod.concepts.map((concept, idx) => {
                          const done = completedIds.has(concept.id);
                          return (
                            <Link
                              key={concept.id}
                              href={`/learn/${concept.level}/${concept.module}/${concept.id}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 16px",
                                borderRadius: "var(--radius-md)",
                                background: done ? "rgba(16,217,138,0.06)" : "var(--bg-card)",
                                border: `1px solid ${done ? "rgba(16,217,138,0.2)" : "var(--border)"}`,
                                textDecoration: "none",
                                transition: "all 0.2s",
                              }}
                              className="curriculum-link"
                            >
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: done ? "rgba(16,217,138,0.2)" : "var(--bg-secondary)",
                                  border: `2px solid ${done ? "var(--accent-green)" : "var(--border)"}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  color: done ? "var(--accent-green)" : "var(--text-muted)",
                                  flexShrink: 0,
                                }}
                              >
                                {done ? "✓" : idx + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "600", fontSize: "0.9rem", color: done ? "var(--accent-green)" : "var(--text-primary)" }}>
                                  {concept.title}
                                </div>
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                ~{concept.estimated_minutes}m
                              </span>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>›</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .curriculum-link:hover {
          border-color: var(--border-hover) !important;
          transform: translateX(2px);
        }
      `}</style>
    </div>
  );
}

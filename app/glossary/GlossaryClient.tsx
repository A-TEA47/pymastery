"use client";

import { useState, useMemo } from "react";
import type { GlossaryTerm } from "@/lib/content";

interface GlossaryClientProps {
  terms: GlossaryTerm[];
}

export default function GlossaryClient({ terms }: GlossaryClientProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return terms;
    const q = search.toLowerCase();
    return terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [terms, search]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    filtered.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(t);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fade-in" style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: "900", marginBottom: "8px" }}>
          📖 Python Glossary
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          {terms.length} terms — from <code style={{ background: "rgba(79,142,247,0.1)", padding: "1px 6px", borderRadius: "4px", color: "var(--accent-blue)" }}>int</code> to metaclasses.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search terms…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 20px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          color: "var(--text-primary)",
          fontSize: "1rem",
          outline: "none",
          marginBottom: "32px",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-blue)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />

      {grouped.length === 0 && (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px" }}>
          No terms match "{search}". Try a different search.
        </p>
      )}

      {/* Letter groups */}
      {grouped.map(([letter, groupTerms]) => (
        <div key={letter} style={{ marginBottom: "32px" }}>
          <div
            style={{
              fontSize: "1.4rem",
              fontWeight: "900",
              color: "var(--accent-blue)",
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: "2px solid rgba(79,142,247,0.2)",
            }}
          >
            {letter}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {groupTerms.map((term) => (
              <div
                key={term.term}
                className="card"
                style={{ padding: "16px 20px" }}
              >
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <code
                    style={{
                      background: "rgba(79,142,247,0.12)",
                      color: "var(--accent-blue)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontFamily: "JetBrains Mono, monospace",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontWeight: "600",
                    }}
                  >
                    {term.term}
                  </code>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                    {term.definition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

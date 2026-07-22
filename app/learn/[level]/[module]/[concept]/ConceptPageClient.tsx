"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import CodeEditor from "@/components/Editor/CodeEditor";
import OutputPanel from "@/components/Output/OutputPanel";
import ProblemCard from "@/components/Problems/ProblemCard";
import { runPython } from "@/lib/pyodideRunner";
import { getConceptProgress, markConceptComplete, updateConceptProgress } from "@/lib/db";
import type { Concept, Problem } from "@/lib/content";

interface ConceptPageClientProps {
  concept: Concept;
  problems: Problem[];
  nextConcept: Concept | null;
}

export default function ConceptPageClient({ concept, problems, nextConcept }: ConceptPageClientProps) {
  const [exampleCode, setExampleCode] = useState(concept.examples[0]?.code || "");
  const [exampleIdx, setExampleIdx] = useState(0);
  const [output, setOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [problemsPassed, setProblemsPassed] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"plain" | "technical">("plain");

  const warmup = problems.find((p) => p.tier === "warmup");
  const applied = problems.find((p) => p.tier === "applied");
  const challenge = problems.find((p) => p.tier === "challenge");

  useEffect(() => {
    // Load Pyodide in background on mount
    import("@/lib/pyodideRunner").then(({ runPython }) => {
      runPython("1+1").then(() => setPyodideLoading(false)).catch(() => setPyodideLoading(false));
    });

    // Load existing progress
    getConceptProgress(concept.id).then((prog) => {
      if (prog) {
        setIsCompleted(prog.completed);
        const passed = new Set<string>();
        if (prog.warmupPassed && warmup) passed.add(warmup.id);
        if (prog.appliedPassed && applied) passed.add(applied.id);
        if (prog.challengePassed && challenge) passed.add(challenge.id);
        setProblemsPassed(passed);
      }
    });
  }, [concept.id]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await runPython(exampleCode);
      setOutput(result.output);
      setErrorOutput(result.errorOutput);
      setHasError(result.hasError);
    } finally {
      setIsRunning(false);
    }
  }, [exampleCode]);

  const handleSwitchExample = (idx: number) => {
    setExampleIdx(idx);
    setExampleCode(concept.examples[idx].code);
    setOutput("");
    setErrorOutput("");
    setHasError(false);
  };

  const handleProblemPassed = useCallback(
    async (problemId: string) => {
      setProblemsPassed((prev) => new Set(prev).add(problemId));
    },
    []
  );

  const handleMarkComplete = useCallback(async () => {
    await markConceptComplete(concept.id);
    setIsCompleted(true);
  }, [concept.id]);

  const levelBadgeClass = `badge badge-${concept.level}`;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <Link href="/curriculum" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>
          Curriculum
        </Link>
        <span>›</span>
        <span style={{ textTransform: "capitalize" }}>{concept.level}</span>
        <span>›</span>
        <span>{concept.module.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}</span>
      </div>

      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <span className={levelBadgeClass}>{concept.level}</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            ⏱ ~{concept.estimated_minutes} min
          </span>
          {isCompleted && (
            <span style={{ background: "rgba(16,217,138,0.15)", color: "var(--accent-green)", padding: "3px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "600" }}>
              ✅ Completed
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: "800", marginBottom: "12px" }}>
          {concept.title}
        </h1>

        {/* Prerequisites */}
        {concept.prerequisites.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Prerequisites:</span>
            {concept.prerequisites.map((pre) => (
              <Link
                key={pre}
                href={`/practice`}
                style={{
                  fontSize: "0.8rem",
                  padding: "2px 10px",
                  borderRadius: "100px",
                  background: "rgba(79,142,247,0.1)",
                  color: "var(--accent-blue)",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                }}
              >
                {pre}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Section 1: Explanation */}
      <section style={{ marginBottom: "40px" }} className="animate-fade-in">
        <div className="tab-bar">
          <button className={`tab-btn ${tab === "plain" ? "active" : ""}`} onClick={() => setTab("plain")}>
            💬 Plain English
          </button>
          <button className={`tab-btn ${tab === "technical" ? "active" : ""}`} onClick={() => setTab("technical")}>
            🔬 Technical
          </button>
        </div>

        <div className="prose">
          {tab === "plain" && (
            <div className="animate-fade-in">
              {concept.plain_explanation.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
          {tab === "technical" && (
            <div className="animate-fade-in">
              {concept.technical_explanation.split("\n\n").map((para, i) => (
                <p key={i} style={{ fontFamily: para.trim().startsWith("#") ? "JetBrains Mono, monospace" : "inherit", fontSize: para.trim().startsWith("#") ? "0.875rem" : "inherit" }}>
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Runnable Examples */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "var(--gradient-blue)", borderRadius: "8px", padding: "4px 10px", fontSize: "0.9rem" }}>▶</span>
          Try It Yourself
        </h2>

        {/* Example switcher */}
        {concept.examples.length > 1 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {concept.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleSwitchExample(i)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "100px",
                  background: i === exampleIdx ? "rgba(79,142,247,0.2)" : "transparent",
                  border: `1px solid ${i === exampleIdx ? "var(--accent-blue)" : "var(--border)"}`,
                  color: i === exampleIdx ? "var(--accent-blue)" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: i === exampleIdx ? "600" : "400",
                  transition: "all 0.2s",
                }}
              >
                {ex.title}
              </button>
            ))}
          </div>
        )}

        {concept.examples[exampleIdx]?.explanation && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "12px" }}>
            {concept.examples[exampleIdx].explanation}
          </p>
        )}

        <CodeEditor value={exampleCode} onChange={setExampleCode} height={240} onRun={handleRun} />

        <div style={{ marginTop: "10px", marginBottom: "8px", display: "flex", gap: "8px" }}>
          <button className="btn-primary" onClick={handleRun} disabled={isRunning} style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
            {isRunning ? "⏳ Running…" : "▶ Run Code"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => { setExampleCode(concept.examples[exampleIdx].code); setOutput(""); setErrorOutput(""); }}
            style={{ padding: "8px 16px", fontSize: "0.875rem" }}
          >
            ↺ Reset
          </button>
        </div>

        <OutputPanel
          output={output}
          errorOutput={errorOutput}
          hasError={hasError}
          isLoading={isRunning}
          pyodideLoading={pyodideLoading}
        />
      </section>

      {/* Section 3: Common Mistakes */}
      {concept.common_mistakes.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span> Common Mistakes
          </h2>
          <div
            style={{
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
            }}
          >
            <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {concept.common_mistakes.map((m, i) => (
                <li key={i} style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Section 4: Problems */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>🎯</span> Your Turn — Practice Problems
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {warmup && (
            <ProblemCard
              problem={warmup}
              conceptId={concept.id}
              onPassed={() => handleProblemPassed(warmup.id)}
            />
          )}
          {applied && (
            <ProblemCard
              problem={applied}
              conceptId={concept.id}
              onPassed={() => handleProblemPassed(applied.id)}
            />
          )}
          {challenge && (
            <ProblemCard
              problem={challenge}
              conceptId={concept.id}
              onPassed={() => handleProblemPassed(challenge.id)}
            />
          )}
          {problems.length === 0 && (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
              Problems coming soon for this concept.
            </div>
          )}
        </div>
      </section>

      {/* Related concepts */}
      {concept.related_concepts.length > 0 && (
        <section style={{ marginBottom: "40px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", color: "var(--text-secondary)" }}>
            Related Concepts
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {concept.related_concepts.map((rc) => (
              <Link
                key={rc}
                href={`/curriculum`}
                style={{
                  padding: "5px 14px",
                  borderRadius: "100px",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
              >
                {rc}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mark complete + Next */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {!isCompleted ? (
          <button className="btn-green" onClick={handleMarkComplete} style={{ fontSize: "1rem", padding: "12px 28px" }}>
            ✅ Mark as Complete
          </button>
        ) : (
          <div style={{ color: "var(--accent-green)", fontWeight: "700", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            ✅ Concept Complete!
          </div>
        )}

        {nextConcept && (
          <Link
            href={`/learn/${nextConcept.level}/${nextConcept.module}/${nextConcept.id}`}
            className="btn-primary"
            style={{ textDecoration: "none", fontSize: "0.95rem", padding: "12px 28px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            Next: {nextConcept.title} →
          </Link>
        )}
      </div>
    </div>
  );
}

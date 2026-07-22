"use client";

import { useState, useCallback } from "react";
import CodeEditor from "@/components/Editor/CodeEditor";
import OutputPanel from "@/components/Output/OutputPanel";
import { runPython } from "@/lib/pyodideRunner";
import { gradeCode, GradeResult } from "@/lib/grader";
import { recordProblemAttempt, updateConceptProgress } from "@/lib/db";
import type { Problem } from "@/lib/content";

interface ProblemCardProps {
  problem: Problem;
  conceptId: string;
  onPassed?: () => void;
}

export default function ProblemCard({ problem, conceptId, onPassed }: ProblemCardProps) {
  const [code, setCode] = useState(problem.starter_code);
  const [output, setOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [solutionRequested, setSolutionRequested] = useState(false);
  const [tab, setTab] = useState<"editor" | "solution">("editor");
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerStart] = useState(Date.now());

  const tierColors: Record<string, string> = {
    warmup: "var(--accent-green)",
    applied: "var(--accent-blue)",
    challenge: "var(--accent-orange)",
  };

  const tierLabel: Record<string, string> = {
    warmup: "🟢 Warm-up",
    applied: "🔵 Applied",
    challenge: "🔥 Challenge",
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setGradeResult(null);
    try {
      const result = await runPython(code);
      setOutput(result.output);
      setErrorOutput(result.errorOutput);
      setHasError(result.hasError);
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  const handleSubmit = useCallback(async () => {
    setIsTesting(true);
    setGradeResult(null);
    setOutput("");
    setErrorOutput("");
    setHasError(false);

    try {
      const result = await gradeCode(
        code,
        problem.test_cases,
        problem.hidden_test_cases,
        problem.function_name
      );
      setGradeResult(result);

      const timeTaken = Math.round((Date.now() - timerStart) / 1000);

      await recordProblemAttempt({
        problemId: problem.id,
        conceptId,
        passed: result.allPassed,
        code,
        hintsUsed,
        solutionViewed: solutionVisible,
        attemptedAt: Date.now(),
        timeTakenSeconds: timeTaken,
      });

      if (result.allPassed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        // Update concept progress
        const tierKey = `${problem.tier}Passed` as "warmupPassed" | "appliedPassed" | "challengePassed";
        await updateConceptProgress(conceptId, { [tierKey]: true });
        onPassed?.();
      }
    } finally {
      setIsTesting(false);
    }
  }, [code, problem, conceptId, hintsUsed, solutionVisible, timerStart, onPassed]);

  const revealHint = useCallback(async () => {
    if (hintsUsed >= problem.hints.length) return;
    setHintsUsed((h) => h + 1);
  }, [hintsUsed, problem.hints.length]);

  const requestSolution = useCallback(async () => {
    setSolutionRequested(true);
    setSolutionVisible(true);
    setTab("solution");
    await updateConceptProgress(conceptId, { solutionViewed: true });
  }, [conceptId]);

  return (
    <div
      className="card"
      style={{ padding: "24px", position: "relative", overflow: "hidden" }}
    >
      {/* Confetti overlay */}
      {showConfetti && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(16, 217, 138, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 10,
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span
              className={`badge badge-${problem.tier}`}
              style={{ fontSize: "0.75rem" }}
            >
              {tierLabel[problem.tier]}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {"★".repeat(problem.difficulty)}{"☆".repeat(10 - problem.difficulty)}
            </span>
            {problem.time_limit_minutes && (
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                ⏱ {problem.time_limit_minutes} min
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>{problem.title}</h3>
        </div>

        {gradeResult && (
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "100px",
              background: gradeResult.allPassed
                ? "rgba(16, 217, 138, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              color: gradeResult.allPassed ? "var(--accent-green)" : "var(--accent-red)",
              fontSize: "0.85rem",
              fontWeight: "700",
              whiteSpace: "nowrap",
            }}
          >
            {gradeResult.allPassed
              ? `✅ ${gradeResult.passCount}/${gradeResult.totalCount} Passed`
              : `❌ ${gradeResult.passCount}/${gradeResult.totalCount} Passed`}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div
        style={{
          background: "rgba(79, 142, 247, 0.06)",
          border: "1px solid rgba(79, 142, 247, 0.15)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
          {problem.prompt}
        </p>
      </div>

      {/* Visible test cases preview */}
      {problem.test_cases.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Example Cases
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {problem.test_cases.slice(0, 3).map((tc, i) => (
              <div
                key={i}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Input:</span>{" "}
                <span style={{ color: "var(--accent-blue)" }}>{JSON.stringify(tc.input)}</span>{" "}
                <span style={{ color: "var(--text-muted)" }}>→</span>{" "}
                <span style={{ color: "var(--accent-green)" }}>{JSON.stringify(tc.expected)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: editor / solution */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === "editor" ? "active" : ""}`}
          onClick={() => setTab("editor")}
        >
          ✏️ Your Solution
        </button>
        {solutionVisible && (
          <button
            className={`tab-btn ${tab === "solution" ? "active" : ""}`}
            onClick={() => setTab("solution")}
          >
            💡 Reference Solution
          </button>
        )}
      </div>

      {/* Editor */}
      {tab === "editor" && (
        <div style={{ marginBottom: "12px" }}>
          <CodeEditor
            value={code}
            onChange={setCode}
            height={200}
            onRun={handleRun}
          />
        </div>
      )}

      {/* Solution view */}
      {tab === "solution" && solutionVisible && (
        <div style={{ marginBottom: "12px" }}>
          <CodeEditor
            value={problem.solution_code}
            onChange={() => {}}
            height={200}
            readOnly
          />
        </div>
      )}

      {/* Buttons */}
      {tab === "editor" && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <button
            className="btn-secondary"
            onClick={handleRun}
            disabled={isRunning || isTesting}
            style={{ padding: "8px 18px", fontSize: "0.85rem" }}
          >
            {isRunning ? "⏳ Running…" : "▶ Run Code"}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isRunning || isTesting}
            style={{ padding: "8px 18px", fontSize: "0.85rem" }}
          >
            {isTesting ? "⏳ Checking…" : "✓ Submit & Test"}
          </button>

          {/* Hints */}
          {problem.hints.length > 0 && hintsUsed < problem.hints.length && !gradeResult?.allPassed && (
            <button
              className="btn-secondary"
              onClick={revealHint}
              style={{ padding: "8px 18px", fontSize: "0.85rem", marginLeft: "auto" }}
            >
              💡 Hint {hintsUsed + 1}/{problem.hints.length}
            </button>
          )}

          {/* Show solution (after 2 failures) */}
          {!solutionVisible && gradeResult && !gradeResult.allPassed && (
            <button
              onClick={requestSolution}
              style={{
                padding: "8px 18px",
                fontSize: "0.85rem",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              See Solution
            </button>
          )}
        </div>
      )}

      {/* Hints display */}
      {hintsUsed > 0 && (
        <div style={{ marginBottom: "12px" }}>
          {problem.hints.slice(0, hintsUsed).map((hint, i) => (
            <div
              key={i}
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "6px",
                fontSize: "0.875rem",
                color: "var(--accent-yellow)",
              }}
              className="animate-fade-in"
            >
              💡 <strong>Hint {i + 1}:</strong> {hint}
            </div>
          ))}
        </div>
      )}

      {/* Output panel (only for free run, not grading) */}
      {(output || errorOutput || isRunning) && tab === "editor" && (
        <div style={{ marginBottom: "12px" }}>
          <OutputPanel
            output={output}
            errorOutput={errorOutput}
            hasError={hasError}
            isLoading={isRunning}
          />
        </div>
      )}

      {/* Grade results */}
      {gradeResult && (
        <div className="animate-fade-in">
          {gradeResult.allPassed ? (
            <div
              style={{
                background: "rgba(16, 217, 138, 0.1)",
                border: "1px solid rgba(16, 217, 138, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
              }}
            >
              <p style={{ margin: "0 0 4px", fontWeight: "700", color: "var(--accent-green)", fontSize: "1.05rem" }}>
                🎉 All tests passed!
              </p>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {gradeResult.passCount}/{gradeResult.totalCount} test cases passed including hidden tests.
              </p>
            </div>
          ) : (
            <div>
              {gradeResult.results
                .filter((r) => !r.passed)
                .slice(0, 2)
                .map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginBottom: "8px",
                      fontSize: "0.85rem",
                      color: "var(--accent-red)",
                    }}
                  >
                    {r.plainMessage}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* External reference */}
      {problem.external_reference && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
          <a
            href={problem.external_reference.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🔗</span>
            <span>Practice more: {problem.external_reference.title}</span>
            <span style={{ opacity: 0.6 }}>↗</span>
          </a>
        </div>
      )}
    </div>
  );
}

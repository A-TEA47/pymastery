// lib/grader.ts
// Grading logic — runs tests via Pyodide worker and formats plain-language results

import { runTests, TestCase, TestResult } from "./pyodideRunner";

export interface GradeResult {
  allPassed: boolean;
  passCount: number;
  totalCount: number;
  results: GradedTest[];
}

export interface GradedTest {
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  plainMessage: string;
  error?: string | null;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "None";
  if (typeof v === "string") return `"${v}"`;
  if (Array.isArray(v)) return `[${v.map(formatValue).join(", ")}]`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function buildPlainMessage(test: TestResult): string {
  if (test.error) {
    const shortError = test.error.split("\n").slice(-2).join(" ").trim();
    return `❌ Your code caused an error: ${shortError}`;
  }
  if (test.passed) {
    return `✅ Correct! For input ${formatValue(test.input)}, your function returned ${formatValue(test.actual)}.`;
  }
  return `❌ For input ${formatValue(test.input)}, your function returned ${formatValue(test.actual)}, but the expected answer is ${formatValue(test.expected)}.`;
}

export async function gradeCode(
  code: string,
  visibleTestCases: TestCase[],
  hiddenTestCases: TestCase[],
  functionName: string
): Promise<GradeResult> {
  const allTests = [...visibleTestCases, ...hiddenTestCases];

  const { results } = await runTests(code, allTests, functionName);

  const graded: GradedTest[] = results.map((r) => ({
    passed: r.passed,
    input: r.input,
    expected: r.expected,
    actual: r.actual,
    plainMessage: buildPlainMessage(r),
    error: r.error,
  }));

  const passCount = graded.filter((g) => g.passed).length;
  const allPassed = passCount === graded.length;

  return {
    allPassed,
    passCount,
    totalCount: graded.length,
    results: graded,
  };
}

// Mastery score based on how the learner solved the problem
export function computeMasteryScore(params: {
  allPassed: boolean;
  hintsUsed: number;
  solutionViewed: boolean;
  tier: "warmup" | "applied" | "challenge";
}): number {
  if (!params.allPassed) return 0;
  if (params.solutionViewed) return 20;

  const tierBase = params.tier === "warmup" ? 30 : params.tier === "applied" ? 60 : 100;
  const hintPenalty = Math.min(params.hintsUsed * 10, 40);

  return Math.max(tierBase - hintPenalty, 10);
}

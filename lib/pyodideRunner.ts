// lib/pyodideRunner.ts
// TypeScript interface for the Pyodide Web Worker

export interface RunResult {
  output: string;
  errorOutput: string;
  hasError: boolean;
}

export interface TestCase {
  input: unknown[];
  expected: unknown;
}

export interface TestResult {
  input: unknown[];
  expected: unknown;
  actual: unknown;
  passed: boolean;
  error?: string | null;
}

export interface TestRunResult {
  results: TestResult[];
}

let worker: Worker | null = null;
let workerReady = false;
let pendingCallbacks: Map<string, (data: unknown) => void> = new Map();
let readyCallbacks: (() => void)[] = [];

function getWorker(): Promise<Worker> {
  return new Promise((resolve) => {
    if (worker && workerReady) {
      resolve(worker);
      return;
    }

    if (worker && !workerReady) {
      readyCallbacks.push(() => resolve(worker!));
      return;
    }

    worker = new Worker("/pyodideWorker.js");

    worker.onmessage = (event) => {
      const { id, type } = event.data;

      if (type === "ready") {
        workerReady = true;
        readyCallbacks.forEach((cb) => cb());
        readyCallbacks = [];
        resolve(worker!);
        return;
      }

      if (id && pendingCallbacks.has(id)) {
        const cb = pendingCallbacks.get(id)!;
        pendingCallbacks.delete(id);
        cb(event.data);
      }
    };

    worker.onerror = (err) => {
      console.error("Pyodide Worker Error:", err);
    };
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export async function runPython(code: string): Promise<RunResult> {
  const w = await getWorker();
  const id = generateId();

  return new Promise((resolve) => {
    pendingCallbacks.set(id, (data: unknown) => {
      const d = data as RunResult & { type: string; error?: string };
      if (d.type === "error") {
        resolve({ output: "", errorOutput: d.error || "Unknown error", hasError: true });
      } else {
        resolve({ output: d.output || "", errorOutput: d.errorOutput || "", hasError: d.hasError || false });
      }
    });

    w.postMessage({ id, type: "run", code });
  });
}

export async function runTests(
  code: string,
  testCases: TestCase[],
  functionName: string
): Promise<TestRunResult> {
  const w = await getWorker();
  const id = generateId();

  return new Promise((resolve) => {
    pendingCallbacks.set(id, (data: unknown) => {
      const d = data as { type: string; results?: TestResult[]; error?: string };
      if (d.type === "error") {
        resolve({
          results: testCases.map((tc) => ({
            input: tc.input,
            expected: tc.expected,
            actual: null,
            passed: false,
            error: d.error || "Worker error",
          })),
        });
      } else {
        resolve({ results: d.results || [] });
      }
    });

    w.postMessage({ id, type: "test", code, testCases, functionName });
  });
}

export function isPyodideReady(): boolean {
  return workerReady;
}

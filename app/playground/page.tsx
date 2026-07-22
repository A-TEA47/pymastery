"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CodeEditor from "@/components/Editor/CodeEditor";
import OutputPanel from "@/components/Output/OutputPanel";
import { runPython } from "@/lib/pyodideRunner";
import type { Metadata } from "next";

const STARTER = `# Welcome to the PyMastery Playground! 🎮
# This is a free scratchpad — write any Python code and run it.
# No grading, no pressure. Just experiment!

message = "Hello, Python!"
print(message)

# Try changing the code and press Ctrl+Enter (or Run) to execute
numbers = [1, 2, 3, 4, 5]
print("Sum:", sum(numbers))
print("Squares:", [n**2 for n in numbers])
`;

const SNIPPETS = [
  { label: "Hello World", code: 'print("Hello, World!")\nprint("Welcome to Python!")\n' },
  { label: "List Operations", code: `fruits = ["apple", "banana", "cherry", "date"]
print("All fruits:", fruits)
print("First:", fruits[0])
print("Last:", fruits[-1])
print("Sorted:", sorted(fruits))
print("Length:", len(fruits))
` },
  { label: "Dictionary", code: `person = {"name": "Alice", "age": 30, "city": "NYC"}

for key, value in person.items():
    print(f"{key}: {value}")

# Add new key
person["language"] = "Python"
print("\\nUpdated:", person)
` },
  { label: "Functions", code: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

def is_even(n):
    return n % 2 == 0

print(greet("Alice"))
print(greet("Bob", "Hi"))
print([n for n in range(10) if is_even(n)])
` },
  { label: "List Comprehension", code: `# Squares of even numbers from 0 to 20
result = [x**2 for x in range(21) if x % 2 == 0]
print(result)

# Word lengths
words = ["python", "is", "awesome", "and", "fun"]
lengths = {word: len(word) for word in words}
print(lengths)
` },
  { label: "Fibonacci", code: `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=" ")
        a, b = b, a + b
    print()

fibonacci(15)
` },
  { label: "Recursion", code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for i in range(1, 11):
    print(f"{i}! = {factorial(i)}")
` },
];

export default function PlaygroundPage() {
  const [code, setCode] = useState(STARTER);
  const [output, setOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [history, setHistory] = useState<{ code: string; output: string; time: string }[]>([]);

  useEffect(() => {
    runPython("1").then(() => setPyodideLoading(false)).catch(() => setPyodideLoading(false));
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await runPython(code);
      setOutput(result.output);
      setErrorOutput(result.errorOutput);
      setHasError(result.hasError);

      if (result.output || result.errorOutput) {
        setHistory((prev) => [
          { code: code.slice(0, 80) + (code.length > 80 ? "…" : ""), output: result.output || result.errorOutput, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9),
        ]);
      }
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fade-in" style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.2rem)", fontWeight: "900", marginBottom: "8px" }}>
          🎮 Python Playground
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          A free scratchpad. Write any Python, run it instantly. No grading — just explore.
        </p>
      </div>

      {/* Quick snippets */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        {SNIPPETS.map((s) => (
          <button
            key={s.label}
            onClick={() => { setCode(s.code); setOutput(""); setErrorOutput(""); }}
            style={{
              padding: "5px 14px",
              borderRadius: "100px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        <div>
          <CodeEditor value={code} onChange={setCode} height={400} onRun={handleRun} />
          <div style={{ display: "flex", gap: "10px", marginTop: "12px", marginBottom: "12px" }}>
            <button className="btn-primary" onClick={handleRun} disabled={isRunning} style={{ padding: "10px 24px" }}>
              {isRunning ? "⏳ Running…" : "▶ Run Code"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setCode(STARTER); setOutput(""); setErrorOutput(""); }}
              style={{ padding: "10px 18px" }}
            >
              ↺ Reset
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setOutput(""); setErrorOutput(""); setHasError(false); }}
              style={{ padding: "10px 18px" }}
            >
              🗑 Clear Output
            </button>
          </div>
          <OutputPanel
            output={output}
            errorOutput={errorOutput}
            hasError={hasError}
            isLoading={isRunning}
            pyodideLoading={pyodideLoading}
          />
        </div>

        {/* Run history */}
        <div>
          <div className="card" style={{ padding: "16px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>
              Run History
            </h3>
            {history.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No runs yet. Hit Run to start!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                    onClick={() => setCode(history[i].code)}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>{h.time}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {h.code}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: "16px", marginTop: "12px" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>
              💡 Tips
            </h3>
            <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>Press <code style={{ background: "var(--bg-secondary)", padding: "1px 4px", borderRadius: "3px" }}>Ctrl+Enter</code> to run</li>
              <li>Python runs in your browser via Pyodide — no server needed</li>
              <li>Use print() to see values</li>
              <li>Errors show in red — read the last line for the message</li>
              <li>Try the quick snippets above for inspiration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

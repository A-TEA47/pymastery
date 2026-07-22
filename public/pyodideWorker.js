// PyMastery — Pyodide Web Worker
// Runs Python code in a Web Worker so it never blocks the UI thread

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

let pyodide = null;
let pyodideReady = false;

async function loadPyodideInstance() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
  });
  pyodideReady = true;
  postMessage({ type: "ready" });
}

loadPyodideInstance();

self.onmessage = async (event) => {
  const { id, type, code, testCases, functionName } = event.data;

  if (!pyodideReady) {
    postMessage({ id, type: "error", error: "Pyodide is still loading..." });
    return;
  }

  if (type === "run") {
    try {
      // Capture stdout/stderr
      await pyodide.runPythonAsync(`
import sys
import io
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

      let output = "";
      let errorOutput = "";
      let hasError = false;

      try {
        await pyodide.runPythonAsync(code);
        output = pyodide.runPython("_stdout_capture.getvalue()");
        errorOutput = pyodide.runPython("_stderr_capture.getvalue()");
      } catch (err) {
        hasError = true;
        errorOutput = err.message || String(err);
        // Still grab any stdout that happened before the error
        try {
          output = pyodide.runPython("_stdout_capture.getvalue()");
        } catch (_) {}
      } finally {
        // Restore stdout/stderr
        try {
          await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
        } catch (_) {}
      }

      postMessage({ id, type: "result", output, errorOutput, hasError });
    } catch (err) {
      postMessage({ id, type: "error", error: err.message || String(err) });
    }
  }

  if (type === "test") {
    try {
      const results = [];

      for (const tc of testCases) {
        let passed = false;
        let actual = null;
        let errorMsg = null;

        try {
          // Reset stdout
          await pyodide.runPythonAsync(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

          // Run the user's code to define the function
          await pyodide.runPythonAsync(code);

          // Build the call: functionName(*args)
          const argsJson = JSON.stringify(tc.input);

          const testScript = `
import json
_args = json.loads(${JSON.stringify(argsJson)})
_result = ${functionName}(*_args)
# Convert to JSON-serializable
import builtins
if isinstance(_result, (list, tuple)):
    _result = builtins.list(_result)
json.dumps(_result)
`;
          const resultJson = await pyodide.runPythonAsync(testScript);
          actual = JSON.parse(resultJson);

          const expected = tc.expected;

          // Deep equality check
          passed = JSON.stringify(actual) === JSON.stringify(expected);
        } catch (err) {
          errorMsg = err.message || String(err);
          passed = false;
        }

        results.push({
          input: tc.input,
          expected: tc.expected,
          actual,
          passed,
          error: errorMsg,
        });
      }

      // Restore stdout
      try {
        await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
      } catch (_) {}

      postMessage({ id, type: "testResult", results });
    } catch (err) {
      postMessage({ id, type: "error", error: err.message || String(err) });
    }
  }
};

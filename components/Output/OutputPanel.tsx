"use client";

interface OutputPanelProps {
  output: string;
  errorOutput: string;
  hasError: boolean;
  isLoading: boolean;
  pyodideLoading?: boolean;
}

export default function OutputPanel({
  output,
  errorOutput,
  hasError,
  isLoading,
  pyodideLoading = false,
}: OutputPanelProps) {
  const isEmpty = !output && !errorOutput && !isLoading && !pyodideLoading;

  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        minHeight: "120px",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: "8px 16px",
          background: "#161b27",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isLoading ? "var(--accent-yellow)" : hasError ? "var(--accent-red)" : output ? "var(--accent-green)" : "var(--text-muted)",
            transition: "background 0.3s",
          }}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
          Output
        </span>
        {isLoading && (
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--accent-yellow)",
              marginLeft: "auto",
            }}
          >
            Running…
          </span>
        )}
        {pyodideLoading && !isLoading && (
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--accent-blue)",
              marginLeft: "auto",
            }}
          >
            Loading Python engine…
          </span>
        )}
      </div>

      {/* Output content */}
      <div style={{ padding: "12px 16px", minHeight: "80px" }}>
        {pyodideLoading && !isLoading && !output && !errorOutput && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid var(--accent-blue)",
                borderTopColor: "transparent",
                borderRadius: "50%",
              }}
              className="animate-spin"
            />
            Warming up Python (Pyodide is loading for the first time…)
          </div>
        )}

        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid var(--accent-yellow)",
                borderTopColor: "transparent",
                borderRadius: "50%",
              }}
              className="animate-spin"
            />
            Executing Python…
          </div>
        )}

        {isEmpty && !pyodideLoading && (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            # Click Run or press Ctrl+Enter to execute your code
          </p>
        )}

        {output && (
          <pre
            style={{
              color: "#e6edf3",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.875rem",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {output}
          </pre>
        )}

        {errorOutput && (
          <div style={{ marginTop: output ? "12px" : 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                padding: "2px 8px",
                marginBottom: "8px",
                fontSize: "0.75rem",
                color: "var(--accent-red)",
                fontWeight: "600",
              }}
            >
              ⚠ Error
            </div>
            <pre
              style={{
                color: "#f87171",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.8rem",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {errorOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

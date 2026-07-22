"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
  onRun?: () => void;
}

export default function CodeEditor({
  value,
  onChange,
  height = 280,
  readOnly = false,
  onRun,
}: CodeEditorProps) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "#0d1117",
      }}
    >
      {/* Editor title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          background: "#161b27",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28ca41" }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>
            solution.py
          </span>
        </div>
        {onRun && (
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            Ctrl+Enter to run
          </span>
        )}
      </div>

      <MonacoEditor
        height={typeof height === "number" ? `${height}px` : height}
        language="python"
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "line",
          padding: { top: 12, bottom: 12 },
          readOnly,
          cursorBlinking: "smooth",
          smoothScrolling: true,
          contextmenu: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
        }}
        onMount={(editor, monaco) => {
          // Ctrl+Enter to run
          if (onRun) {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              onRun
            );
          }

          // Python-style auto-indent
          editor.addCommand(
            monaco.KeyCode.Tab,
            () => {
              editor.trigger("keyboard", "type", { text: "    " });
            }
          );
        }}
      />
    </div>
  );
}

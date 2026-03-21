import { useState, useRef, useCallback } from "react";
import type { VimAction } from "@vimee/core";
import { Vim } from "@vimee/shiki-editor";
import "@vimee/shiki-editor/styles.css";
import { createHighlighter } from "shiki";

const THEMES = [
  "vitesse-dark",
  "vitesse-light",
  "github-dark",
  "github-light",
  "dracula",
  "nord",
  "one-dark-pro",
  "tokyo-night",
  "catppuccin-mocha",
  "solarized-dark",
] as const;

const LANGS = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "html",
  "css",
  "json",
  "markdown",
  "bash",
] as const;

const highlighter = await createHighlighter({
  themes: [...THEMES],
  langs: [...LANGS],
});

const DEFAULT_CONTENT = `package main

import (
\t"fmt"
\t"log"
\t"net/http"
)

func main() {
\thttp.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
\t\tfmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
\t})

\tlog.Println("Listening on :8080")
\tlog.Fatal(http.ListenAndServe(":8080", nil))
}
`;

interface ActionLog {
  id: number;
  timestamp: string;
  action: VimAction;
  key: string;
}

function App() {
  const [theme, setTheme] = useState<string>("catppuccin-mocha");
  const [lang, setLang] = useState<string>("go");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [indentStyle, setIndentStyle] = useState<"space" | "tab">("tab");
  const [indentWidth, setIndentWidth] = useState(4);

  const [logs, setLogs] = useState<ActionLog[]>([]);
  const logIdRef = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleAction = useCallback((action: VimAction, key: string) => {
    const entry: ActionLog = {
      id: logIdRef.current++,
      timestamp: new Date().toISOString().slice(11, 23),
      action,
      key,
    };
    setLogs((prev) => {
      const next = [...prev, entry];
      return next.length > 200 ? next.slice(-200) : next;
    });
    requestAnimationFrame(() => {
      logContainerRef.current?.scrollTo({
        top: logContainerRef.current.scrollHeight,
      });
    });
  }, []);

  const isDark = !theme.includes("light");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: isDark ? "#1a1a2e" : "#f5f5f5",
        color: isDark ? "#e0e0e0" : "#1a1a1a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
      }}
    >
      {/* Settings Panel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "8px 16px",
          background: isDark ? "#16213e" : "#e8e8e8",
          borderBottom: `1px solid ${isDark ? "#0f3460" : "#ccc"}`,
          flexWrap: "wrap",
          fontSize: 13,
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Theme
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={selectStyle(isDark)}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Language
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={selectStyle(isDark)}
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
          />
          Line Numbers
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
          Read Only
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Indent
          <select
            value={indentStyle}
            onChange={(e) =>
              setIndentStyle(e.target.value as "space" | "tab")
            }
            style={selectStyle(isDark)}
          >
            <option value="space">Spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Width
          <select
            value={indentWidth}
            onChange={(e) => setIndentWidth(Number(e.target.value))}
            style={selectStyle(isDark)}
          >
            {[2, 4, 8].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Editor */}
      <div style={{ overflow: "auto" }}>
        <Vim
          content={DEFAULT_CONTENT}
          highlighter={highlighter}
          lang={lang}
          theme={theme}
          showLineNumbers={showLineNumbers}
          readOnly={readOnly}
          indentStyle={indentStyle}
          indentWidth={indentWidth}
          autoFocus
          onChange={(c) => console.log("Changed:", c)}
          onSave={(c) => console.log("Saved:", c)}
          onAction={handleAction}
        />
      </div>

      {/* Action Log */}
      <div
        style={{
          height: 200,
          borderTop: `1px solid ${isDark ? "#0f3460" : "#ccc"}`,
          display: "flex",
          flexDirection: "column",
          background: isDark ? "#0a0a1a" : "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 12px",
            background: isDark ? "#16213e" : "#e8e8e8",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span>Action Log ({logs.length})</span>
          <button
            onClick={() => setLogs([])}
            style={{
              background: "none",
              border: `1px solid ${isDark ? "#444" : "#bbb"}`,
              color: isDark ? "#aaa" : "#555",
              borderRadius: 3,
              padding: "1px 8px",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Clear
          </button>
        </div>
        <div
          ref={logContainerRef}
          style={{
            flex: 1,
            overflow: "auto",
            padding: "4px 12px",
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >
          {logs.length === 0 && (
            <div style={{ color: isDark ? "#555" : "#aaa", padding: "8px 0" }}>
              Interact with the editor to see actions here...
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: isDark ? "#555" : "#aaa", flexShrink: 0 }}>
                {log.timestamp}
              </span>
              <span
                style={{
                  color: actionColor(log.action.type, isDark),
                  flexShrink: 0,
                  minWidth: 120,
                }}
              >
                {log.action.type}
              </span>
              <span style={{ color: isDark ? "#e2b714" : "#b45309", flexShrink: 0 }}>
                {formatKey(log.key)}
              </span>
              <span style={{ color: isDark ? "#888" : "#666" }}>
                {formatPayload(log.action)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function selectStyle(isDark: boolean): React.CSSProperties {
  return {
    background: isDark ? "#1a1a2e" : "#fff",
    color: isDark ? "#e0e0e0" : "#1a1a1a",
    border: `1px solid ${isDark ? "#333" : "#bbb"}`,
    borderRadius: 3,
    padding: "2px 4px",
    fontSize: 13,
  };
}

function actionColor(type: string, isDark: boolean): string {
  const colors: Record<string, string> = isDark
    ? {
        "cursor-move": "#4fc1ff",
        "content-change": "#6a9955",
        "mode-change": "#c586c0",
        yank: "#dcdcaa",
        save: "#4ec9b0",
        "status-message": "#ce9178",
        scroll: "#569cd6",
        "set-option": "#d7ba7d",
        noop: "#555",
      }
    : {
        "cursor-move": "#0070c1",
        "content-change": "#267f00",
        "mode-change": "#af00db",
        yank: "#795e26",
        save: "#267f99",
        "status-message": "#a31515",
        scroll: "#0000ff",
        "set-option": "#795e26",
        noop: "#aaa",
      };
  return colors[type] ?? (isDark ? "#888" : "#666");
}

function formatKey(key: string): string {
  if (key === " ") return "<Space>";
  if (key === "\n" || key === "Enter") return "<Enter>";
  if (key === "Escape") return "<Esc>";
  if (key === "Backspace") return "<BS>";
  if (key === "Tab") return "<Tab>";
  if (key === "ArrowUp") return "<Up>";
  if (key === "ArrowDown") return "<Down>";
  if (key === "ArrowLeft") return "<Left>";
  if (key === "ArrowRight") return "<Right>";
  return key;
}

function formatPayload(action: VimAction): string {
  switch (action.type) {
    case "cursor-move":
      return `${action.position.line + 1}:${action.position.col + 1}`;
    case "content-change":
      return action.content.length > 60
        ? action.content.slice(0, 60) + "..."
        : action.content;
    case "mode-change":
      return action.mode;
    case "yank":
      return action.text;
    case "save":
      return `(${action.content.length} chars)`;
    case "status-message":
      return action.message;
    case "scroll":
      return `${action.direction} ${action.amount}`;
    case "set-option":
      return `${action.option} = ${action.value}`;
    case "noop":
      return "";
  }
}

export default App;

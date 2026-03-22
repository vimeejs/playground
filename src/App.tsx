import { useState, useRef, useCallback } from "react";
import type { VimAction } from "@vimee/core";
import { Vim } from "@vimee/shiki-editor";
import "@vimee/shiki-editor/styles.css";
import { createHighlighter } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ColorControls } from "@/components/color-controls";

const THEMES = [
  "catppuccin-mocha",
  "vitesse-dark",
  "vitesse-light",
  "github-dark",
  "github-light",
  "dracula",
  "nord",
  "one-dark-pro",
  "tokyo-night",
  "solarized-dark",
] as const;

const LANGS = [
  "go",
  "typescript",
  "javascript",
  "python",
  "rust",
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
\t"context"
\t"encoding/json"
\t"fmt"
\t"log"
\t"net/http"
\t"os"
\t"os/signal"
\t"sync"
\t"syscall"
\t"time"
)

// Config holds server configuration.
type Config struct {
\tAddr            string        \`json:"addr"\`
\tReadTimeout     time.Duration \`json:"read_timeout"\`
\tWriteTimeout    time.Duration \`json:"write_timeout"\`
\tShutdownTimeout time.Duration \`json:"shutdown_timeout"\`
}

// DefaultConfig returns a Config with sensible defaults.
func DefaultConfig() Config {
\treturn Config{
\t\tAddr:            ":8080",
\t\tReadTimeout:     5 * time.Second,
\t\tWriteTimeout:    10 * time.Second,
\t\tShutdownTimeout: 30 * time.Second,
\t}
}

// User represents a user in the system.
type User struct {
\tID        int       \`json:"id"\`
\tName      string    \`json:"name"\`
\tEmail     string    \`json:"email"\`
\tCreatedAt time.Time \`json:"created_at"\`
}

// UserStore is a thread-safe in-memory user store.
type UserStore struct {
\tmu    sync.RWMutex
\tusers map[int]User
\tnext  int
}

// NewUserStore creates a new UserStore with sample data.
func NewUserStore() *UserStore {
\ts := &UserStore{
\t\tusers: make(map[int]User),
\t\tnext:  1,
\t}
\ts.Add(User{Name: "Alice", Email: "alice@example.com"})
\ts.Add(User{Name: "Bob", Email: "bob@example.com"})
\ts.Add(User{Name: "Charlie", Email: "charlie@example.com"})
\treturn s
}

// Add inserts a new user and returns the assigned ID.
func (s *UserStore) Add(u User) int {
\ts.mu.Lock()
\tdefer s.mu.Unlock()
\tu.ID = s.next
\tu.CreatedAt = time.Now()
\ts.users[s.next] = u
\ts.next++
\treturn u.ID
}

// Get retrieves a user by ID.
func (s *UserStore) Get(id int) (User, bool) {
\ts.mu.RLock()
\tdefer s.mu.RUnlock()
\tu, ok := s.users[id]
\treturn u, ok
}

// List returns all users sorted by ID.
func (s *UserStore) List() []User {
\ts.mu.RLock()
\tdefer s.mu.RUnlock()
\tresult := make([]User, 0, len(s.users))
\tfor _, u := range s.users {
\t\tresult = append(result, u)
\t}
\treturn result
}

// Delete removes a user by ID, returning true if found.
func (s *UserStore) Delete(id int) bool {
\ts.mu.Lock()
\tdefer s.mu.Unlock()
\t_, ok := s.users[id]
\tif ok {
\t\tdelete(s.users, id)
\t}
\treturn ok
}

// Server wraps http.Server with application dependencies.
type Server struct {
\thttp   *http.Server
\tstore  *UserStore
\tlogger *log.Logger
}

// NewServer creates a Server from the given Config.
func NewServer(cfg Config) *Server {
\tlogger := log.New(os.Stdout, "[api] ", log.LstdFlags|log.Lshortfile)
\tstore := NewUserStore()

\ts := &Server{
\t\tstore:  store,
\t\tlogger: logger,
\t}

\tmux := http.NewServeMux()
\tmux.HandleFunc("GET /healthz", s.handleHealthz)
\tmux.HandleFunc("GET /api/users", s.handleListUsers)
\tmux.HandleFunc("GET /api/users/{id}", s.handleGetUser)
\tmux.HandleFunc("POST /api/users", s.handleCreateUser)
\tmux.HandleFunc("DELETE /api/users/{id}", s.handleDeleteUser)

\ts.http = &http.Server{
\t\tAddr:         cfg.Addr,
\t\tHandler:      s.withLogging(mux),
\t\tReadTimeout:  cfg.ReadTimeout,
\t\tWriteTimeout: cfg.WriteTimeout,
\t}

\treturn s
}

// withLogging is middleware that logs each request.
func (s *Server) withLogging(next http.Handler) http.Handler {
\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
\t\tstart := time.Now()
\t\tnext.ServeHTTP(w, r)
\t\ts.logger.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
\t})
}

func (s *Server) handleHealthz(w http.ResponseWriter, _ *http.Request) {
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func (s *Server) handleListUsers(w http.ResponseWriter, _ *http.Request) {
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(s.store.List())
}

func (s *Server) handleGetUser(w http.ResponseWriter, r *http.Request) {
\tid := 0
\tfmt.Sscanf(r.PathValue("id"), "%d", &id)

\tu, ok := s.store.Get(id)
\tif !ok {
\t\thttp.Error(w, \`{"error":"user not found"}\`, http.StatusNotFound)
\t\treturn
\t}
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(u)
}

func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
\tvar u User
\tif err := json.NewDecoder(r.Body).Decode(&u); err != nil {
\t\thttp.Error(w, \`{"error":"invalid json"}\`, http.StatusBadRequest)
\t\treturn
\t}
\tif u.Name == "" || u.Email == "" {
\t\thttp.Error(w, \`{"error":"name and email required"}\`, http.StatusBadRequest)
\t\treturn
\t}
\tid := s.store.Add(u)
\tu, _ = s.store.Get(id)
\tw.Header().Set("Content-Type", "application/json")
\tw.WriteHeader(http.StatusCreated)
\tjson.NewEncoder(w).Encode(u)
}

func (s *Server) handleDeleteUser(w http.ResponseWriter, r *http.Request) {
\tid := 0
\tfmt.Sscanf(r.PathValue("id"), "%d", &id)

\tif !s.store.Delete(id) {
\t\thttp.Error(w, \`{"error":"user not found"}\`, http.StatusNotFound)
\t\treturn
\t}
\tw.WriteHeader(http.StatusNoContent)
}

// Run starts the server and blocks until shutdown.
func (s *Server) Run() error {
\tctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
\tdefer stop()

\tgo func() {
\t\ts.logger.Printf("listening on %s", s.http.Addr)
\t\tif err := s.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
\t\t\ts.logger.Fatalf("listen: %v", err)
\t\t}
\t}()

\t<-ctx.Done()
\ts.logger.Println("shutting down...")

\tshutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
\tdefer cancel()
\treturn s.http.Shutdown(shutdownCtx)
}

func main() {
\tcfg := DefaultConfig()
\tsrv := NewServer(cfg)
\tif err := srv.Run(); err != nil {
\t\tlog.Fatalf("server error: %v", err)
\t}
}
`;

interface ActionLog {
  id: number;
  timestamp: string;
  action: VimAction;
  key: string;
}

function App() {
  const [theme, setTheme] = useState<BundledTheme>("catppuccin-mocha");
  const [lang, setLang] = useState<BundledLanguage>("go");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [indentStyle, setIndentStyle] = useState<"space" | "tab">("tab");
  const [indentWidth, setIndentWidth] = useState(4);

  const [logs, setLogs] = useState<ActionLog[]>([]);
  const logIdRef = useRef(0);

  const handleAction = useCallback((action: VimAction, key: string) => {
    const entry: ActionLog = {
      id: logIdRef.current++,
      timestamp: new Date().toISOString().slice(11, 23),
      action,
      key,
    };
    setLogs((prev) => {
      const next = [entry, ...prev];
      return next.length > 200 ? next.slice(0, 200) : next;
    });
  }, []);

  return (
    <div className="grid h-screen max-h-screen grid-cols-12 grid-rows-[auto_8fr_4fr] bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="col-span-12 flex h-10 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight">
            vimee
          </span>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            playground
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/vimeejs/playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="col-span-2 row-span-2 border-r border-border overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Theme */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Theme
            </Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as BundledTheme)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t} value={t} className="text-sm">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Language
            </Label>
            <Select value={lang} onValueChange={(v) => setLang(v as BundledLanguage)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l} value={l} className="text-sm">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Editor Options */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Editor
            </Label>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Line Numbers</Label>
              <Switch
                checked={showLineNumbers}
                onCheckedChange={setShowLineNumbers}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Read Only</Label>
              <Switch
                checked={readOnly}
                onCheckedChange={setReadOnly}
              />
            </div>
          </div>

          <Separator />

          {/* Indent */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Indent
            </Label>

            <div className="space-y-2">
              <Label className="text-sm text-foreground/80">Style</Label>
              <Select
                value={indentStyle}
                onValueChange={(v) => setIndentStyle(v as "space" | "tab")}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="space" className="text-sm">Spaces</SelectItem>
                  <SelectItem value="tab" className="text-sm">Tabs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground/80">Width</Label>
              <Select
                value={String(indentWidth)}
                onValueChange={(v) => setIndentWidth(Number(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2" className="text-sm">2</SelectItem>
                  <SelectItem value="4" className="text-sm">4</SelectItem>
                  <SelectItem value="8" className="text-sm">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <ColorControls />
        </div>
      </aside>

      {/* Editor */}
      <div className="col-span-10 overflow-auto border-b border-border">
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
      <div className="col-span-10 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Actions
            </span>
            <Badge variant="outline" className="text-xs px-2 py-0.5 font-mono">
              {logs.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => setLogs([])}
          >
            Clear
          </Button>
        </div>
        <ScrollArea className="h-0 flex-1">
          <div className="px-4 py-2 font-mono text-xs leading-relaxed">
            {logs.length === 0 && (
              <p className="text-muted-foreground/50 italic py-2">
                Interact with the editor to see actions here...
              </p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3">
                <span className="text-muted-foreground/40 shrink-0">
                  {log.timestamp}
                </span>
                <span className={`shrink-0 min-w-[120px] font-semibold ${actionTypeClass(log.action.type)}`}>
                  {log.action.type}
                </span>
                <span className="text-amber-400/80 shrink-0">
                  {formatKey(log.key)}
                </span>
                <span className="text-muted-foreground truncate">
                  {formatPayload(log.action)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function actionTypeClass(type: string): string {
  const map: Record<string, string> = {
    "cursor-move": "text-sky-400",
    "content-change": "text-green-400",
    "mode-change": "text-purple-400",
    yank: "text-yellow-400",
    save: "text-teal-400",
    "status-message": "text-orange-400",
    scroll: "text-blue-400",
    "set-option": "text-indigo-300",
    noop: "text-muted-foreground/40",
  };
  return map[type] ?? "text-muted-foreground";
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

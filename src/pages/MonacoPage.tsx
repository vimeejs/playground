import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { attach } from "@vimee/plugin-monaco";
import type { VimMode, VimMonaco } from "@vimee/plugin-monaco";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  "typescript",
  "javascript",
  "go",
  "python",
  "rust",
  "html",
  "css",
  "json",
  "markdown",
  "bash",
] as const;

const THEMES = [
  { value: "vs-dark", label: "Dark" },
  { value: "vs", label: "Light" },
  { value: "hc-black", label: "High Contrast" },
] as const;

const DEFAULT_CONTENT = `// Welcome to the vimee monaco playground!
// This uses @vimee/plugin-monaco to attach
// Vim keybindings to a Monaco Editor instance.
//
// Try:
//   - hjkl to move the cursor
//   - i to enter insert mode
//   - v to enter visual mode
//   - :w to save (check the console)
//   - dd to delete a line
//   - yy to yank a line
//   - p to paste

interface User {
  id: string;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return {
    id: crypto.randomUUID(),
    name,
    email,
  };
}

const users: User[] = [
  createUser("Alice", "alice@example.com"),
  createUser("Bob", "bob@example.com"),
  createUser("Charlie", "charlie@example.com"),
];

for (const user of users) {
  console.log(\`Hello, \${user.name} (\${user.email})!\`);
}
`;

export function MonacoPage({ fullscreen = false }: { fullscreen?: boolean }) {
  const vimRef = useRef<VimMonaco | null>(null);
  const [mode, setMode] = useState<VimMode>("normal");
  const [cursor, setCursor] = useState({ line: 0, col: 0 });
  const [readOnly, setReadOnly] = useState(false);
  const [indentStyle, setIndentStyle] = useState<"space" | "tab">("space");
  const [indentWidth, setIndentWidth] = useState(2);
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("vs-dark");
  const [lineNumbers, setLineNumbers] = useState(true);
  const [minimap, setMinimap] = useState(false);

  // Store editor instance to re-attach when options change
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    attachVim(editor);
  };

  function attachVim(editor: Parameters<OnMount>[0]) {
    // Destroy previous vim instance
    vimRef.current?.destroy();

    const vim = attach(editor, {
      readOnly,
      indentStyle,
      indentWidth,
      onModeChange: (m) => setMode(m),
      onSave: (value) => console.log("Saved:", value),
      onYank: (text) => console.log("Yanked:", text),
      onAction: () => {
        const c = vim.getCursor();
        setCursor(c);
      },
    });

    vimRef.current = vim;
  }

  // Re-attach when vim options change
  useEffect(() => {
    if (editorRef.current) {
      attachVim(editorRef.current);
    }
    return () => {
      vimRef.current?.destroy();
    };
  }, [readOnly, indentStyle, indentWidth]);

  const modeColor: Record<string, string> = {
    normal: "text-foreground",
    insert: "text-green-400",
    visual: "text-purple-400",
    "visual-line": "text-purple-400",
    "visual-block": "text-purple-400",
    "command-line": "text-foreground",
  };

  const editorElement = (
    <Editor
      defaultValue={DEFAULT_CONTENT}
      language={language}
      theme={theme}
      onMount={handleEditorMount}
      options={{
        fontSize: 14,
        fontFamily: "monospace",
        lineNumbers: lineNumbers ? "on" : "off",
        minimap: { enabled: minimap },
        scrollBeyondLastLine: false,
        renderLineHighlight: "all",
        padding: { top: 16 },
        tabSize: indentWidth,
        insertSpaces: indentStyle === "space",
        readOnly,
      }}
    />
  );

  if (fullscreen) {
    return <div className="h-full w-full">{editorElement}</div>;
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="col-span-2 row-span-2 border-r border-border overflow-y-auto">
        <div className="p-4 space-y-5">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Editor
            </Label>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Read Only</Label>
              <Switch
                checked={readOnly}
                onCheckedChange={setReadOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Line Numbers</Label>
              <Switch
                checked={lineNumbers}
                onCheckedChange={setLineNumbers}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Minimap</Label>
              <Switch
                checked={minimap}
                onCheckedChange={setMinimap}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} className="text-sm">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Theme
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-sm">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

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

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Status
            </Label>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Mode</Label>
              <span className={`text-sm font-mono font-semibold ${modeColor[mode] ?? ""}`}>
                {mode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Cursor</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {cursor.line + 1}:{cursor.col + 1}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Monaco Editor */}
      <div className="col-span-10 row-span-2 overflow-hidden">
        {editorElement}
      </div>
    </>
  );
}

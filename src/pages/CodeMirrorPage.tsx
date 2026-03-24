import { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { go } from "@codemirror/lang-go";
import { rust } from "@codemirror/lang-rust";
import { attach } from "@vimee/plugin-codemirror";
import type { VimMode, VimCodeMirror } from "@vimee/plugin-codemirror";

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
] as const;

type Language = (typeof LANGUAGES)[number];

// Map language names to CodeMirror language extensions
function getLanguageExtension(lang: Language) {
  switch (lang) {
    case "typescript":
      return javascript({ typescript: true });
    case "javascript":
      return javascript();
    case "go":
      return go();
    case "python":
      return python();
    case "rust":
      return rust();
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
    case "markdown":
      return markdown();
  }
}

const DEFAULT_CONTENT = `// Welcome to the vimee CodeMirror playground!
// This uses @vimee/plugin-codemirror to attach
// Vim keybindings to a CodeMirror 6 editor instance.
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

export function CodeMirrorPage({
  fullscreen = false,
}: {
  fullscreen?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const vimRef = useRef<VimCodeMirror | null>(null);

  const [mode, setMode] = useState<VimMode>("normal");
  const [cursor, setCursor] = useState({ line: 0, col: 0 });
  const [readOnly, setReadOnly] = useState(false);
  const [indentStyle, setIndentStyle] = useState<"space" | "tab">("space");
  const [indentWidth, setIndentWidth] = useState(2);
  const [language, setLanguage] = useState<Language>("typescript");
  const [lineNumbers, setLineNumbers] = useState(true);

  // Track content across re-creations
  const contentRef = useRef(DEFAULT_CONTENT);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy previous instances
    vimRef.current?.destroy();
    viewRef.current?.destroy();

    const extensions = [
      basicSetup,
      oneDark,
      getLanguageExtension(language),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
      }),
    ];

    if (!lineNumbers) {
      extensions.push(EditorView.lineWrapping);
    }

    const state = EditorState.create({
      doc: contentRef.current,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    const vim = attach(view, {
      readOnly,
      indentStyle,
      indentWidth,
      onModeChange: (m) => setMode(m),
      onSave: (value) => console.log("Saved:", value),
      onYank: (text) => console.log("Yanked:", text),
      onChange: (value) => {
        contentRef.current = value;
      },
      onAction: () => {
        const c = vim.getCursor();
        setCursor(c);
      },
    });

    vimRef.current = vim;

    return () => {
      vimRef.current?.destroy();
      viewRef.current?.destroy();
      vimRef.current = null;
      viewRef.current = null;
    };
  }, [language, readOnly, indentStyle, indentWidth, lineNumbers]);

  const modeColor: Record<string, string> = {
    normal: "text-foreground",
    insert: "text-green-400",
    visual: "text-purple-400",
    "visual-line": "text-purple-400",
    "visual-block": "text-purple-400",
    "command-line": "text-foreground",
  };

  const editorElement = (
    <div ref={containerRef} className="h-full w-full overflow-hidden" />
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
              <Switch checked={readOnly} onCheckedChange={setReadOnly} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Line Numbers</Label>
              <Switch
                checked={lineNumbers}
                onCheckedChange={setLineNumbers}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Language
            </Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
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
                  <SelectItem value="space" className="text-sm">
                    Spaces
                  </SelectItem>
                  <SelectItem value="tab" className="text-sm">
                    Tabs
                  </SelectItem>
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
                  <SelectItem value="2" className="text-sm">
                    2
                  </SelectItem>
                  <SelectItem value="4" className="text-sm">
                    4
                  </SelectItem>
                  <SelectItem value="8" className="text-sm">
                    8
                  </SelectItem>
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
              <span
                className={`text-sm font-mono font-semibold ${modeColor[mode] ?? ""}`}
              >
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

      {/* CodeMirror Editor */}
      <div className="col-span-10 row-span-2 overflow-hidden">
        {editorElement}
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { attach } from "@vimee/plugin-textarea";
import type { VimMode } from "@vimee/core";

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

const DEFAULT_CONTENT = `// Welcome to the vimee textarea playground!
// This uses @vimee/plugin-textarea to attach
// Vim keybindings to a plain <textarea> element.
//
// Try:
//   - hjkl to move the cursor
//   - i to enter insert mode
//   - v to enter visual mode
//   - :w to save (check the console)
//   - dd to delete a line
//   - yy to yank a line
//   - p to paste

function greet(name: string): string {
  return "Hello, " + name + "!";
}

const users = ["Alice", "Bob", "Charlie"];

for (const user of users) {
  console.log(greet(user));
}
`;

export function TextareaPage({ fullscreen = false }: { fullscreen?: boolean }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<VimMode>("normal");
  const [cursor, setCursor] = useState({ line: 0, col: 0 });
  const [readOnly, setReadOnly] = useState(false);
  const [indentStyle, setIndentStyle] = useState<"space" | "tab">("space");
  const [indentWidth, setIndentWidth] = useState(2);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const vim = attach(textarea, {
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

    return () => vim.destroy();
  }, [readOnly, indentStyle, indentWidth]);

  const modeColor: Record<string, string> = {
    normal: "text-foreground",
    insert: "text-green-400",
    visual: "text-purple-400",
    "visual-line": "text-purple-400",
    "visual-block": "text-purple-400",
    "command-line": "text-foreground",
  };

  if (fullscreen) {
    return (
      <textarea
        ref={textareaRef}
        defaultValue={DEFAULT_CONTENT}
        className="h-full w-full resize-none bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 leading-relaxed focus:outline-none"
        spellCheck={false}
        autoComplete="off"
        autoFocus
      />
    );
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

      {/* Textarea */}
      <div className="col-span-10 row-span-2 flex flex-col overflow-hidden">
        <textarea
          ref={textareaRef}
          defaultValue={DEFAULT_CONTENT}
          className="flex-1 w-full resize-none bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 leading-relaxed focus:outline-none"
          spellCheck={false}
          autoComplete="off"
          autoFocus
        />
      </div>
    </>
  );
}

import { useState, useCallback, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface ColorEntry {
  variable: string;
  label: string;
  defaultHex: string;
  defaultAlpha: number;
}

const COLOR_ENTRIES: ColorEntry[] = [
  { variable: "--sv-cursor-color", label: "Cursor", defaultHex: "#ffffff", defaultAlpha: 70 },
  { variable: "--sv-selection-bg", label: "Selection BG", defaultHex: "#6496ff", defaultAlpha: 30 },
  { variable: "--sv-search-match-bg", label: "Search Match", defaultHex: "#ffc832", defaultAlpha: 35 },
  { variable: "--sv-gutter-color", label: "Gutter", defaultHex: "#858585", defaultAlpha: 100 },
  { variable: "--sv-gutter-bg", label: "Gutter BG", defaultHex: "#000000", defaultAlpha: 0 },
  { variable: "--sv-statusline-bg", label: "Statusline BG", defaultHex: "#252526", defaultAlpha: 100 },
  { variable: "--sv-statusline-fg", label: "Statusline FG", defaultHex: "#cccccc", defaultAlpha: 100 },
  { variable: "--sv-focus-color", label: "Focus", defaultHex: "#007acc", defaultAlpha: 100 },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function buildCssColor(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  if (alpha >= 100) return hex;
  if (alpha <= 0) return "transparent";
  return `rgba(${r}, ${g}, ${b}, ${(alpha / 100).toFixed(2)})`;
}

interface ColorState {
  hex: string;
  alpha: number;
}

export function ColorControls() {
  const [colors, setColors] = useState<Record<string, ColorState>>(() => {
    const initial: Record<string, ColorState> = {};
    for (const entry of COLOR_ENTRIES) {
      initial[entry.variable] = { hex: entry.defaultHex, alpha: entry.defaultAlpha };
    }
    return initial;
  });

  const applyColor = useCallback((variable: string, hex: string, alpha: number) => {
    document.documentElement.style.setProperty(variable, buildCssColor(hex, alpha));
  }, []);

  const handleColorChange = useCallback(
    (variable: string, hex: string) => {
      setColors((prev) => {
        const next = { ...prev, [variable]: { ...prev[variable], hex } };
        applyColor(variable, hex, next[variable].alpha);
        return next;
      });
    },
    [applyColor],
  );

  const handleAlphaChange = useCallback(
    (variable: string, alpha: number) => {
      setColors((prev) => {
        const next = { ...prev, [variable]: { ...prev[variable], alpha } };
        applyColor(variable, next[variable].hex, alpha);
        return next;
      });
    },
    [applyColor],
  );

  const handleReset = useCallback(() => {
    const initial: Record<string, ColorState> = {};
    for (const entry of COLOR_ENTRIES) {
      initial[entry.variable] = { hex: entry.defaultHex, alpha: entry.defaultAlpha };
      document.documentElement.style.removeProperty(entry.variable);
    }
    setColors(initial);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Editor Colors
        </Label>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 text-[10px] text-muted-foreground hover:text-destructive px-1.5"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        {COLOR_ENTRIES.map((entry) => (
          <ColorRow
            key={entry.variable}
            entry={entry}
            state={colors[entry.variable]}
            onColorChange={handleColorChange}
            onAlphaChange={handleAlphaChange}
          />
        ))}
      </div>
    </div>
  );
}

function ColorRow({
  entry,
  state,
  onColorChange,
  onAlphaChange,
}: {
  entry: ColorEntry;
  state: ColorState;
  onColorChange: (variable: string, hex: string) => void;
  onAlphaChange: (variable: string, alpha: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handlePickerInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onColorChange(entry.variable, hex);
      }, 16);
      document.documentElement.style.setProperty(
        entry.variable,
        buildCssColor(hex, state.alpha),
      );
    },
    [entry.variable, state.alpha, onColorChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <button
          className="size-5 shrink-0 rounded border border-border cursor-pointer"
          style={{ backgroundColor: buildCssColor(state.hex, state.alpha) }}
          onClick={() => inputRef.current?.click()}
        />
        <input
          ref={inputRef}
          type="color"
          value={state.hex}
          onChange={handlePickerInput}
          className="sr-only"
        />
        <span className="text-xs text-foreground/80 flex-1 truncate">
          {entry.label}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
          {state.alpha}%
        </span>
      </div>
      <div className="pl-7">
        <Slider
          value={[state.alpha]}
          onValueChange={([v]) => onAlphaChange(entry.variable, v)}
          min={0}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
}

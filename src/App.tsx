import { useCallback, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHashRoute } from "@/hooks/useHashRoute";
import { ShikiEditorPage } from "@/pages/ShikiEditorPage";
import { TextareaPage } from "@/pages/TextareaPage";
import { MonacoPage } from "@/pages/MonacoPage";
import { CodeMirrorPage } from "@/pages/CodeMirrorPage";

function App() {
  const { route, navigate } = useHashRoute();
  const [fullscreen, setFullscreen] = useState(false);

  const exitFullscreen = useCallback(() => setFullscreen(false), []);

  const page =
    route === "shiki-editor" ? (
      <ShikiEditorPage fullscreen={fullscreen} />
    ) : route === "textarea" ? (
      <TextareaPage fullscreen={fullscreen} />
    ) : route === "codemirror" ? (
      <CodeMirrorPage fullscreen={fullscreen} />
    ) : (
      <MonacoPage fullscreen={fullscreen} />
    );

  if (fullscreen) {
    return (
      <div className="h-screen w-screen bg-background text-foreground overflow-hidden relative">
        <button
          type="button"
          onClick={exitFullscreen}
          className="absolute top-2 right-2 z-50 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors backdrop-blur-sm"
          title="Exit fullscreen"
        >
          <Minimize2 className="size-4" />
        </button>
        {page}
      </div>
    );
  }

  return (
    <div className="grid h-screen max-h-screen grid-cols-12 grid-rows-[auto_8fr_4fr] bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="col-span-12 flex h-10 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight">vimee</span>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            playground
          </Badge>
        </div>
        <nav className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate("shiki-editor")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              route === "shiki-editor"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            shiki-editor
          </button>
          <button
            type="button"
            onClick={() => navigate("textarea")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              route === "textarea"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            textarea
          </button>
          <button
            type="button"
            onClick={() => navigate("monaco")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              route === "monaco"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            monaco
          </button>
          <button
            type="button"
            onClick={() => navigate("codemirror")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              route === "codemirror"
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            codemirror
          </button>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="size-4" />
          </button>
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

      {page}
    </div>
  );
}

export default App;

import { Badge } from "@/components/ui/badge";
import { useHashRoute } from "@/hooks/useHashRoute";
import { ShikiEditorPage } from "@/pages/ShikiEditorPage";
import { TextareaPage } from "@/pages/TextareaPage";

function App() {
  const { route, navigate } = useHashRoute();

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
        </nav>
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

      {route === "shiki-editor" ? <ShikiEditorPage /> : <TextareaPage />}
    </div>
  );
}

export default App;

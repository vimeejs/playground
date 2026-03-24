# vimee playground

An interactive playground for [vimee](https://github.com/vimeejs) — try vim-style editing across multiple editor backends in your browser, tweak settings, and inspect every action in real time.

![playground](./assets/vimee-playground.png)

**Live:** [playground.vimee.dev](https://playground.vimee.dev)

## Editors

| Editor | Package | Description |
|--------|---------|-------------|
| **shiki-editor** | `@vimee/shiki-editor` | Full-featured vim editor with syntax highlighting powered by [Shiki](https://shiki.matsu.io/). Includes action log, theme/language switcher, and custom color controls. |
| **textarea** | `@vimee/plugin-textarea` | Vim keybindings attached to a plain `<textarea>` element. Minimal setup for lightweight use cases. |
| **monaco** | `@vimee/plugin-monaco` | Vim keybindings attached to [Monaco Editor](https://microsoft.github.io/monaco-editor/). Supports minimap, built-in themes, and language intelligence. |
| **codemirror** | `@vimee/plugin-codemirror` | Vim keybindings attached to [CodeMirror 6](https://codemirror.net/). Lightweight and extensible with language-specific extensions. |

## Features

- **Vim editor** with multiple editor backends — Shiki, Monaco, CodeMirror, and plain textarea
- **Theme switcher** — catppuccin-mocha, dracula, nord, tokyo-night, and more (varies by editor)
- **Language selector** — Go, TypeScript, JavaScript, Python, Rust, HTML, CSS, JSON, Markdown, Bash
- **Editor options** — toggle line numbers, read-only mode, indent style (tabs/spaces), indent width
- **Editor color controls** — customize `--sv-*` CSS variables (cursor, selection, gutter, statusline, focus) with color pickers and alpha sliders (shiki-editor)
- **Action log** — every vim action (`cursor-move`, `content-change`, `mode-change`, `yank`, `save`, etc.) is logged in reverse chronological order with keystroke and payload details (shiki-editor)

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Shiki](https://shiki.matsu.io/) v4
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [CodeMirror](https://codemirror.net/) 6

## Local development

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)

### Setup

```bash
# Clone the repository
git clone https://github.com/vimeejs/playground.git
cd playground

# Install dependencies
bun install

# Start the dev server
bun run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173).

### Build

```bash
bun run build
```

Output is written to `dist/`. You can preview the production build with:

```bash
bun run preview
```

## License

MIT

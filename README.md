# Content Command X

**Simple. Extensible. Degen-friendly content planner for X (Twitter).**

Now a **native desktop app** built with **Tauri 2 + React + TypeScript + Tailwind CSS v4**.

Plan your posts across multiple weeks, manage custom topics/categories, track balance, and never lose a banger draft again. Data persists in localStorage (stays on your machine).

Made for account managers and degens who want zero-friction organization without bloated SaaS tools.

## Features

- **Multi-week planners** — Add/remove weeks, 7 days × 5 slots (35 posts/week target)
- **Desktop-optimized layout** — Sidebar navigation, wide weekly grid, keyboard-friendly
- **Custom Topics** — Stoicism, Crypto Plays, Political Satire, etc. Add your own with icon + color
- **Topic balance tracking** — Live counts per topic in the active week
- **Full CRUD** — Create, edit, delete, unschedule posts
- **Media tags** — Image / Video / GIF indicators
- **280 char counter**
- **Local persistence** via localStorage (survives app restarts)
- **Dark, high-contrast UI**

## Tech Stack

| Layer | Tech |
| ------- | ------ |
| Desktop shell | Tauri 2 (Rust) |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Build | Vite |
| Storage | localStorage |

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (<https://rustup.rs>)
- Platform build tools:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio C++ Build Tools
  - **Linux**: `webkit2gtk`, `libgtk-3-dev`, etc. (see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/))

### Install & Run

```bash
# 1. Clone
git clone https://github.com/jeepmeta/content-command-x.git
cd content-command-x

# 2. Install JS deps
npm install

# 3. Run in development (opens native window)
npm run tauri:dev

# Or just the web frontend for quick UI iteration
npm run dev
```

### Build for production

```bash
npm run tauri:build
```

Binaries land in `src-tauri/target/release/bundle/`.

## Project Structure

```tree
content-command-x/
├── src/                      # React frontend
│   ├── App.tsx               # Shell + sidebar + modals
│   ├── main.tsx
│   ├── index.css             # Tailwind v4 + theme tokens
│   ├── components/
│   │   ├── Planner.tsx
│   │   ├── Vault.tsx
│   │   ├── Topics.tsx
│   │   ├── PostCard.tsx
│   │   ├── CategoryBadge.tsx
│   │   ├── PostModal.tsx
│   │   └── AssignModal.tsx
│   ├── hooks/
│   │   └── useContentStore.ts  # State + localStorage
│   ├── constants/
│   └── types/
├── src-tauri/                # Tauri / Rust
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── README.md
```

## Data Model

- **Post**: id, content, category, media, status (`draft`|`planned`), plannedWeekId, plannedDay, plannedSlot
- **Week**: id, name
- **Topic**: name, iconName (lucide), colorName (preset)

Everything is persisted automatically to `localStorage` under key `content_command_x_v2`.

## Roadmap Ideas

- [ ] Per-week analytics (topic distribution charts)
- [ ] Search + bulk actions in Vault
- [ ] Export week as thread / copy-to-clipboard
- [ ] Drag-and-drop scheduling
- [ ] Optional cloud sync later
- [ ] One-tap “Post to X” deep link

## License

Private / proprietary for now. Built by @JeepMeta / 789 Studios.

Ship fast. Ship good. WAGMI.

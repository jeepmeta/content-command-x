# Content Command X

**Simple. Extensible. Degen-friendly content planner for X (Twitter).**

Built with Expo + React Native. Plan your posts across multiple weeks, manage custom topics/categories, track balance, and never lose a banger draft again. Local storage persistence so your data stays on device.

Made for account managers and degens who want zero-friction organization without bloated SaaS tools.

## Features
- **Multi-week planners** — Add/remove weeks, 7 days × 5 slots (35 posts/week target)
- **Tap-to-schedule on mobile** — Tap empty slot → pick from your Vault drafts (auto-swaps if occupied)
- **Custom Topics** — Stoicism, Crypto Plays, Political Satire, etc. Add your own with icon + color
- **Topic balance tracking** — Live counts per topic in active week
- **Full CRUD** — Create, edit, delete, unschedule posts
- **Media tags** — Image / Video / GIF indicators
- **280 char counter** with warning
- **Local persistence** via AsyncStorage (survives app restarts)
- **Dark, high-contrast UI** optimized for quick mobile use + web preview
- Easily extensible: add tabs, analytics, export/import, AI draft helper, etc.

## Getting Started

```bash
# 1. Clone
git clone https://github.com/jeepmeta/content-command-x.git
cd content-command-x

# 2. Install
npm install

# 3. Run
npx expo start
```

- Press `a` for Android emulator / `i` for iOS
- Or scan QR with Expo Go app on your phone
- Works great on **Web** too (`w` key) for desktop planning

## Project Structure (Clean & Extensible)

```
content-command-x/
├── App.tsx                 # Main shell + tab switcher + all modals
├── constants/
│   └── index.ts            # DAYS, SLOTS, COLOR_OPTIONS, ICON_MAP, THEME, seeds
├── types/
│   └── index.ts            # Post, Week, Topic, MediaType interfaces
├── hooks/
│   └── useContentStore.ts  # All state, persistence, business logic (actions + computed)
├── components/
│   ├── PostCard.tsx
│   └── CategoryBadge.tsx
├── assets/                 # Add your icon.png, splash etc. (or use defaults)
├── package.json
├── app.json
└── README.md
```

**Key extensibility points:**
- Add new computed metrics or tabs easily in App.tsx + hook
- New media types? Extend `MediaType` + UI buttons
- Want analytics tab? Add to tabBar + render function + new hook selectors
- Future: sync to Supabase / X API / AI agents — hook is ready to extend

## Data Model (Simple)

- **Post**: id, content, category (topic), media, status ('draft'|'planned'), plannedWeekId, plannedDay, plannedSlot
- **Week**: id, name
- **Topic**: name, iconName (lucide), colorName (preset)

All persisted automatically.

## Roadmap Ideas (PRs welcome)
- [ ] Per-week analytics dashboard (completion %, topic distribution charts with react-native-svg)
- [ ] Search + bulk actions in Vault
- [ ] Export week as thread / copy-to-clipboard
- [ ] Scheduled post "due today" reminders (expo-notifications)
- [ ] Theme switcher or more color presets
- [ ] Web drag & drop (react-native-web + HTML5 DnD)
- [ ] One-tap "Post to X" deep link (after auth)

## Tech
- Expo SDK 51
- TypeScript
- React Native (no heavy navigation libs — simple state-driven tabs for speed)
- lucide-react-native icons
- @react-native-async-storage/async-storage

Built by @JeepMeta / 789 Studios for the degen content trenches.

Ship fast. Ship good. WAGMI.
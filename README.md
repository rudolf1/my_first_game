# Quiz Game 🎮

An interactive browser-based quiz game built with **TypeScript**, **Vite**, and **XState** (Self-Descriptive Graph DSL).

## Features

- Greeting screen with player-name input
- 3 multiple-choice questions with instant feedback
- Final score page with accuracy stats
- Fully state-driven via an XState finite-state machine

## State machine

```
greeting ──START──► task1 ──NEXT──► task2 ──NEXT──► task3 ──NEXT──► final
   ▲                                                                    │
   └──────────────────────────RESTART────────────────────────────────── ┘
```

Each task node accepts an `ANSWER` event (to select a choice) and a `NEXT` event (to advance, guarded by `hasAnswered`).

## Getting started

```bash
npm install   # install dependencies
npm run dev   # start the development server → http://localhost:5173
```

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

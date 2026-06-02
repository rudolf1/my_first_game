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

### Other npm commands

| Command | Description |
|---------|-------------|
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Docker

> **Note:** Vite 8 uses Rolldown which contains platform-specific native binaries.
> The JS build must be run on the host before building the Docker image.

```bash
# 1. Build the app
npm install
npm run build

# 2. Build the Docker image (serves via nginx on port 8080)
docker build -t quiz-game:latest .

# 3. Run a single container
docker run -p 8080:80 quiz-game:latest
# → http://localhost:8080
```

## Docker Swarm

```bash
# Initialize swarm (skip if already in a swarm)
docker swarm init

# Build the image on every swarm node (or push to a registry first)
npm install && npm run build
docker build -t quiz-game:latest .

# Deploy the stack (2 replicas, rolling updates, auto-restart)
docker stack deploy -c docker-compose.yml quiz

# View running services
docker service ls

# Remove the stack
docker stack rm quiz
```

The Swarm compose file (`docker-compose.yml`) configures:
- **2 replicas** with rolling `start-first` updates
- Automatic rollback on failure
- CPU / memory resource limits
- Built-in healthcheck via `wget`

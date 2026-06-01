import { createMachine, assign } from "xstate";

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

export interface Question {
  text: string;
  choices: string[];
  correctIndex: number;
}

export interface GameContext {
  playerName: string;
  score: number;
  currentAnswer: number | null;
}

export type GameEvent =
  | { type: "START"; name: string }
  | { type: "ANSWER"; choiceIndex: number }
  | { type: "NEXT" }
  | { type: "RESTART" };

// ---------------------------------------------------------------------------
// Quiz questions
// ---------------------------------------------------------------------------

export const QUESTIONS: Question[] = [
  {
    text: "🌍  Which planet is closest to the Sun?",
    choices: ["Venus", "Earth", "Mercury", "Mars"],
    correctIndex: 2,
  },
  {
    text: "🔢  What is 7 × 8?",
    choices: ["54", "56", "64", "48"],
    correctIndex: 1,
  },
  {
    text: "🎨  Which primary color is missing: Red, Blue, ___?",
    choices: ["Orange", "Purple", "Green", "Yellow"],
    correctIndex: 3,
  },
];

// ---------------------------------------------------------------------------
// XState Self-Descriptive Graph DSL
//
// Nodes (states):  greeting → task1 → task2 → task3 → final
// Edges (events):  START / ANSWER / NEXT / RESTART
// ---------------------------------------------------------------------------

export const gameMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgDpkBiAbQAYBdRUABwHtYBLWJgF2UQE9EBaARgBMwgGwBWAJwBmYQA4AnABYJAGhABPRAA5ZyucslrZ0kWoHDFAX3O60WXIRIVqdBs1bsuPPgKEiEuISUjJyCkqqGtra2iriEubCipJqEbIOzm4YHt7s-kEhYSCRIlExcQlJqaogGVnZeRAWRaVlxNQVVbX1jRlN2XxMrQhtHqDdJH1EfsGhEOGRqlSyM-GJ1mkZkFk5kI6F7iWe5d4k-iBgAE6oJFisSBjOiMgANs8A1o-3KI9EZIUA */
    id: "quiz-game",
    initial: "greeting",

    context: {
      playerName: "",
      score: 0,
      currentAnswer: null,
    } satisfies GameContext,

    states: {
      // ── Node: greeting ──────────────────────────────────────────────────
      greeting: {
        meta: { description: "Welcome screen – collect player name" },
        on: {
          START: {
            target: "task1",
            actions: assign({
              playerName: ({ event }) => event.name.trim() || "Player",
              score: 0,
              currentAnswer: null,
            }),
          },
        },
      },

      // ── Node: task1 ──────────────────────────────────────────────────────
      task1: {
        meta: { description: "Question 1 of 3" },
        on: {
          ANSWER: {
            actions: assign({ currentAnswer: ({ event }) => event.choiceIndex }),
          },
          NEXT: {
            target: "task2",
            guard: "hasAnswered",
            actions: assign({
              score: ({ context }) =>
                context.currentAnswer === QUESTIONS[0].correctIndex
                  ? context.score + 1
                  : context.score,
              currentAnswer: null,
            }),
          },
        },
      },

      // ── Node: task2 ──────────────────────────────────────────────────────
      task2: {
        meta: { description: "Question 2 of 3" },
        on: {
          ANSWER: {
            actions: assign({ currentAnswer: ({ event }) => event.choiceIndex }),
          },
          NEXT: {
            target: "task3",
            guard: "hasAnswered",
            actions: assign({
              score: ({ context }) =>
                context.currentAnswer === QUESTIONS[1].correctIndex
                  ? context.score + 1
                  : context.score,
              currentAnswer: null,
            }),
          },
        },
      },

      // ── Node: task3 ──────────────────────────────────────────────────────
      task3: {
        meta: { description: "Question 3 of 3" },
        on: {
          ANSWER: {
            actions: assign({ currentAnswer: ({ event }) => event.choiceIndex }),
          },
          NEXT: {
            target: "final",
            guard: "hasAnswered",
            actions: assign({
              score: ({ context }) =>
                context.currentAnswer === QUESTIONS[2].correctIndex
                  ? context.score + 1
                  : context.score,
              currentAnswer: null,
            }),
          },
        },
      },

      // ── Node: final ──────────────────────────────────────────────────────
      final: {
        meta: { description: "Final score screen" },
        on: {
          RESTART: {
            target: "greeting",
            actions: assign({
              playerName: "",
              score: 0,
              currentAnswer: null,
            }),
          },
        },
      },
    },
  },
  {
    guards: {
      hasAnswered: ({ context }) => context.currentAnswer !== null,
    },
  }
);

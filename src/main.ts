import { createActor } from "xstate";
import { gameMachine, QUESTIONS } from "./machine";
import "./style.css";

// ---------------------------------------------------------------------------
// Boot the XState actor
// ---------------------------------------------------------------------------

const actor = createActor(gameMachine);
actor.start();

// ---------------------------------------------------------------------------
// Root element
// ---------------------------------------------------------------------------

const app = document.querySelector<HTMLDivElement>("#app")!;

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function progressBar(filled: number, total: number): string {
  const pct = Math.round((filled / total) * 100);
  return `
    <div class="progress-bar">
      <div class="progress-fill" style="width:${pct}%"></div>
    </div>`;
}

function renderGreeting(): void {
  app.innerHTML = `
    <div class="card">
      <span class="emoji-big">🎮</span>
      <h1>Quiz Game</h1>
      <p>Answer <strong>3 questions</strong> and see how high you can score.
         Each correct answer earns you a point!</p>
      <label for="name-input" style="display:block;margin-bottom:.5rem;color:var(--muted);font-size:.9rem;">
        Your name
      </label>
      <input id="name-input" type="text" placeholder="Enter your name…" maxlength="32" autocomplete="off"/>
      <button id="start-btn" class="btn btn-primary">Start Game →</button>
    </div>`;

  const nameInput = app.querySelector<HTMLInputElement>("#name-input")!;
  const startBtn = app.querySelector<HTMLButtonElement>("#start-btn")!;

  nameInput.focus();

  function start() {
    actor.send({ type: "START", name: nameInput.value });
  }

  startBtn.addEventListener("click", start);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") start();
  });
}

function renderTask(taskIndex: number): void {
  const question = QUESTIONS[taskIndex];
  const snapshot = actor.getSnapshot();
  const currentAnswer = snapshot.context.currentAnswer;

  app.innerHTML = `
    <div class="card">
      ${progressBar(taskIndex, QUESTIONS.length)}
      <p class="step-label">Question ${taskIndex + 1} of ${QUESTIONS.length}</p>
      <h2>${question.text}</h2>
      <div class="choices" id="choices"></div>
      <div class="feedback" id="feedback"></div>
      <button id="next-btn" class="btn btn-primary" ${currentAnswer === null ? "disabled" : ""}>
        ${taskIndex === QUESTIONS.length - 1 ? "See Results →" : "Next Question →"}
      </button>
    </div>`;

  const choicesEl = app.querySelector<HTMLDivElement>("#choices")!;
  const feedbackEl = app.querySelector<HTMLDivElement>("#feedback")!;
  const nextBtn = app.querySelector<HTMLButtonElement>("#next-btn")!;

  function renderChoices(selected: number | null): void {
    choicesEl.innerHTML = question.choices
      .map((choice, i) => {
        let cls = "choice-btn";
        if (selected !== null) {
          if (i === question.correctIndex) cls += " correct";
          else if (i === selected) cls += " wrong";
        }
        return `<button class="${cls}" data-index="${i}">${choice}</button>`;
      })
      .join("");

    choicesEl.querySelectorAll<HTMLButtonElement>(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (selected !== null) return; // already answered
        const idx = Number(btn.dataset.index);
        actor.send({ type: "ANSWER", choiceIndex: idx });
      });
    });
  }

  function updateFeedback(selected: number | null): void {
    if (selected === null) {
      feedbackEl.textContent = "";
      feedbackEl.className = "feedback";
      return;
    }
    if (selected === question.correctIndex) {
      feedbackEl.textContent = "✅  Correct!";
      feedbackEl.className = "feedback correct";
    } else {
      feedbackEl.textContent = `❌  Wrong – the answer was "${question.choices[question.correctIndex]}"`;
      feedbackEl.className = "feedback wrong";
    }
  }

  // Initial render
  renderChoices(currentAnswer);
  updateFeedback(currentAnswer);

  // Subscribe to state changes (e.g. ANSWER event)
  const sub = actor.subscribe((snap) => {
    const ans = snap.context.currentAnswer;
    renderChoices(ans);
    updateFeedback(ans);
    nextBtn.disabled = ans === null;
  });

  nextBtn.addEventListener("click", () => {
    sub.unsubscribe();
    actor.send({ type: "NEXT" });
  });
}

function renderFinal(): void {
  const { playerName, score } = actor.getSnapshot().context;
  const total = QUESTIONS.length;
  const pct = Math.round((score / total) * 100);

  let emoji = "😐";
  let message = "Good try!";
  if (score === total) { emoji = "🏆"; message = "Perfect score!"; }
  else if (score >= 2)  { emoji = "🎉"; message = "Well done!"; }
  else if (score === 0) { emoji = "😅"; message = "Better luck next time!"; }

  app.innerHTML = `
    <div class="card">
      ${progressBar(total, total)}
      <span class="emoji-big">${emoji}</span>
      <h1>${message}</h1>
      <p>Here's how <strong>${playerName}</strong> did:</p>

      <div class="score-display">${score} / ${total}</div>

      <div style="margin-bottom:1.5rem">
        <div class="score-row"><span>Correct answers</span><span class="val">${score}</span></div>
        <div class="score-row"><span>Wrong answers</span><span class="val">${total - score}</span></div>
        <div class="score-row"><span>Accuracy</span><span class="val">${pct}%</span></div>
      </div>

      <button id="restart-btn" class="btn btn-primary">Play Again →</button>
    </div>`;

  app.querySelector<HTMLButtonElement>("#restart-btn")!.addEventListener("click", () => {
    actor.send({ type: "RESTART" });
  });
}

// ---------------------------------------------------------------------------
// Main render dispatcher – driven by XState state
// ---------------------------------------------------------------------------

function render(): void {
  const state = actor.getSnapshot().value as string;

  if (state === "greeting") { renderGreeting(); return; }
  if (state === "task1")    { renderTask(0);    return; }
  if (state === "task2")    { renderTask(1);    return; }
  if (state === "task3")    { renderTask(2);    return; }
  if (state === "final")    { renderFinal();    return; }
}

// Re-render whenever the machine transitions to a new state node
actor.subscribe((snap) => {
  const prevState = app.dataset.state ?? "";
  const nextState = snap.value as string;
  if (prevState !== nextState) {
    app.dataset.state = nextState;
    render();
  }
});

// Initial render
render();

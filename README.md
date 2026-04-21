npm# Color Switch Game
Group 2 Project for COMP380 — Color Switch Game with Trivia Questions

## Stack

- **React 19** — UI components
- **Vite 6** — dev server and build tool
- **Tailwind CSS 4** — styling for all UI outside the canvas
- **Canvas API** — tube and ball rendering (no external game libraries)
- **questions.json** — 50 local trivia questions (no backend)

## Getting started

```bash
npm install
npm run dev
```

Then open the localhost URL printed in the terminal.

## How to play

1. Answer trivia questions to control what drops into the tube
2. **Correct answer** — choose which color ball drops
3. **Wrong answer** — a random color ball drops instead
4. Stack **3 balls of the same color** at the top to clear them (+50 pts)
5. Score points for correct answers; a streak multiplier increases your bonus
6. **Game over** when the tube fills up to 10 balls

## Project structure

```
src/
  constants/
    colors.js        — color definitions and randomColor()
    phases.js        — game phase enum
  hooks/
    useQuestions.js  — loads and manages questions from public/questions.json
  components/
    TubeGame.jsx     — main game component (canvas + game logic)
    QuizModal.jsx    — trivia question popup
  App.jsx            — root component
public/
  questions.json     — 50 general knowledge trivia questions
```

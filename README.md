# Color Switch Game
Group 2 Project for COMP380 — Color Switch Game with Trivia Questions

## Stack

- **React 19** — UI components
- **Vite 6** — dev server and build tool
- **Tailwind CSS 4** — styling for all UI outside the canvas
- **Canvas API** — tube and ball rendering (no external game libraries)
- **Supabase** — authentication, stats storage, and custom question sets (PostgreSQL + Auth)
- **Vercel** — hosting and deployment
- **questions.json** — ~300 local trivia questions

## Getting started

Create a `.env` file and add:
```
VITE_SUPABASE_URL=url_here
VITE_SUPABASE_ANON_KEY=key_here
```

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

## Features

- **Guest mode** — play without an account; stats are not saved
- **Auth** — sign up / sign in via Supabase email auth
- **Stats screen** — view scores and question-attempt history per user
- **My Question Sets** — create, edit, and play custom trivia sets stored in Supabase
- **Difficulty scaling** — quiz difficulty increases with your answer streak

## Project structure

```
src/
  constants/
    colors.js                    — color definitions and randomColor()
    phases.js                    — game phase enum
  hooks/
    useQuestions.js              — loads and shuffles questions from public/questions.json
  lib/
    supabase.js                  — Supabase client initialization
  components/
    Auth.jsx                     — sign in / sign up / guest entry screen
    BallsBackground.jsx          — animated balls background for non-game screens
    SpillAnimation.jsx           — game-over spill animation
    TubeGame.jsx                 — main game component (canvas + game logic)
    QuizModal.jsx                — trivia question popup with difficulty scaling
    StatsScreen.jsx              — per-user score and attempt history
    MyQuestionSetsScreen.jsx     — list, play, edit, and delete custom sets
    CreateQuestionSetScreen.jsx  — form to create a new custom question set
    EditQuestionSetScreen.jsx    — form to edit questions within an existing set
  App.jsx                        — root component and screen router
public/
  questions.json                 — ~300 general knowledge trivia questions
supabase_schema.sql              — Supabase table definitions (game_sessions, question_attempts, sets, questions)
```

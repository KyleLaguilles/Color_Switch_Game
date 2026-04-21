# Quoc Hiep Huynh — Role 2: Quiz System & Game Logic

## Overview
This folder documents my contribution for **Role 2: Quiz System & Game Logic** in our COMSC 380 group project: **Color Switch Game with Trivia Questions**.

My role focuses on the logic that connects the **quiz system** to the **gameplay system**. In the current team prototype, this includes:
- question flow
- answer evaluation
- reward and penalty behavior
- score and streak updates
- how quiz outcomes affect the next ball drop
- how game phases transition after a question is answered

This role is aligned with the team’s actual project structure, which uses **React, Vite, Tailwind CSS, Canvas API, and local question data from `public/questions.json`**.

---

## Current Team Architecture Relevant to My Role

### `src/hooks/useQuestions.js`
This hook loads and shuffles questions from `public/questions.json` and exposes `getNextQuestion()` to the rest of the app.

### `src/components/QuizModal.jsx`
This component displays the quiz question, category, difficulty, and answer options. It checks the selected answer and triggers either `onCorrect` or `onWrong`.

### `src/components/TubeGame.jsx`
This is the main gameplay component. It handles score, streak, ball dropping, color behavior after correct or wrong answers, triple-match clearing, and game-over detection.

### `public/questions.json`
This file stores the local question bank used by the quiz system.

---

## My Role Responsibilities
My responsibilities include:

- understanding and documenting the quiz flow
- defining how quiz outcomes affect gameplay
- clarifying reward and penalty logic
- explaining how score and streak should update
- helping structure the logic behind question-to-game transitions
- supporting future refinement of difficulty and checkpoint behavior
- preparing documentation and progress notes for the team and instructor

---

## What Is Already Implemented in the Team Prototype
In the current team version, the following features related to my role are already present:

- questions are loaded from a local JSON file
- questions are shuffled
- quiz questions are displayed in a modal
- answers are randomized for display
- correct answers trigger a “correct” path
- wrong answers trigger a “wrong” path
- correct answers increase score and streak
- wrong answers reset streak
- wrong answers lead to a random incorrect color drop
- matching 3 balls of the same color clears them
- the game ends when the tube reaches 10 balls

---

## How My Role Maps to the Real Project
My role is not a separate mini-app. It is the **logic layer** that helps define and support:

1. **Question retrieval**
   - getting the next question from the question pool

2. **Quiz interaction**
   - showing the question
   - displaying answer choices
   - validating the selected answer

3. **Game response**
   - correct answer → player chooses the ball color
   - wrong answer → a random wrong color is dropped
   - score and streak are updated based on result

4. **Progression rules**
   - maintaining game flow between QUESTION, CORRECT, DROPPING, and GAME_OVER states

---

## Role 2 Functional Focus
My role mainly covers these functional areas:

- The system shall retrieve a question when the game needs one.
- The system shall display answer options to the player.
- The system shall determine whether the selected answer is correct.
- The system shall apply reward logic after a correct answer.
- The system shall apply penalty logic after a wrong answer.
- The system shall update score and streak values after each answer.
- The system shall support game continuation after the quiz result is processed.
- The system shall trigger game over when the tube reaches its maximum capacity.

---

## Example Acceptance Criteria

### Correct Answer
**Given** a quiz question is displayed  
**When** the player selects the correct answer  
**Then** the system shall increase the score and streak and allow the player to choose the next ball color

### Wrong Answer
**Given** a quiz question is displayed  
**When** the player selects an incorrect answer  
**Then** the system shall reset the streak and assign a random incorrect ball color

### Game Over
**Given** balls are stacked in the tube  
**When** the total number of balls reaches 10  
**Then** the system shall display the game-over state

### Triple Match
**Given** balls have been dropped into the tube  
**When** 3 adjacent balls of the same color are matched  
**Then** the system shall remove them and award bonus points

---

## Current Progress
At this point, I have:

- reviewed the current project structure
- identified the files connected to my role
- aligned my role with the actual React/Vite implementation
- documented the quiz-to-gameplay flow
- prepared notes for instructor progress review
- clarified where future improvements for quiz/game logic should go

---

## Planned Next Steps
My next steps are:

- refine documentation for the current quiz/game rules
- support improvement of difficulty and question progression
- help clarify how checkpoint-based quiz triggering should work if the team expands the current logic
- assist with cleanup and organization of my GitHub contribution so it matches the team workflow

---

## Notes
This folder is meant to document and support my Role 2 contribution in the real team codebase. It is intentionally aligned with the existing project structure instead of presenting a disconnected standalone demo.

---

## Author
**Quoc Hiep Huynh**  
Role 2 — Quiz System & Game Logic  
COMSC 380 – Intro Software Engineering Project

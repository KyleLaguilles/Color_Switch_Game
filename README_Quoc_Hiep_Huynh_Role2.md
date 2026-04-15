# Quoc Hiep Huynh — Role 2: Quiz System & Game Logic Engineer

## Overview
This file documents my contribution for **Role 2: Quiz System & Game Logic Engineer** in our COMSC 380 project.

My responsibility is to design and implement the **quiz flow and rule-based game logic** that connects checkpoints, question handling, answer evaluation, rewards/penalties, combo streaks, and score progression.

To match the team’s web-based stack, this part is implemented in **HTML, CSS, and JavaScript**.

---

## Responsibilities
I am responsible for:

- Triggering quiz events at checkpoints
- Managing multiple-choice quiz questions
- Evaluating answers as correct or incorrect
- Applying rewards and penalties
- Managing combo/streak logic
- Supporting difficulty scaling for quiz questions
- Updating score based on quiz performance
- Providing modular logic for integration with the main game

---

## Tech Stack for My Part
- **HTML** — quiz popup structure / demo page
- **CSS** — quiz styling
- **JavaScript** — quiz logic, scoring, streaks, effects, difficulty scaling

---

## Main Features Implemented

### 1. Quiz Trigger Logic
- Quiz appears when a checkpoint condition is met
- Trigger rule can be adjusted depending on final game integration

### 2. Question Management
- Supports multiple-choice questions
- Supports categories and difficulty levels
- Avoids repeated questions when possible

### 3. Answer Evaluation
- Checks whether the selected answer is correct
- Returns a result object for the game/UI layer

### 4. Reward / Penalty System
Examples:
- Correct answer → keep same color / bonus score / increase streak
- Incorrect answer → change color / reset streak / apply penalty effect

### 5. Combo / Streak Logic
- Tracks consecutive correct answers
- Applies bonus logic based on streak length

### 6. Score Calculation
- Adds quiz-based score bonus
- Supports future integration with gameplay-based score (such as distance or obstacles)

### 7. Difficulty Scaling
- Supports increasing question difficulty based on checkpoint progress

---

## Files / Modules

### JavaScript Implementation
- `questions.js` — question bank (category, difficulty, options, correct answer)
- `quizLogic.js` — core quiz logic and rule engine
- `app.js` — connects quiz logic to the UI/demo
- `index.html` — demo interface for testing this module
- `styles.css` — styling for the quiz interface

---

## Design Goals
This module was designed to be:

- **Modular** — easy to connect with gameplay and UI
- **Testable** — rules can be checked independently
- **Traceable** — requirements map clearly to implementation
- **Simple enough for class scope** — avoids unnecessary complexity

---

## Example Rule Flow
1. Player reaches checkpoint
2. System triggers quiz
3. Player selects an answer
4. Logic evaluates correctness
5. Reward or penalty is applied
6. Score and streak are updated
7. Game resumes

---

## Example Acceptance Criteria

### Quiz Trigger
- **Given** the player reaches a checkpoint  
- **When** the checkpoint condition is met  
- **Then** the system shall display a quiz question

### Correct Answer
- **Given** a quiz question is displayed  
- **When** the player selects the correct answer  
- **Then** the system shall increase score and streak and apply the correct-answer reward

### Incorrect Answer
- **Given** a quiz question is displayed  
- **When** the player selects an incorrect answer  
- **Then** the system shall reset streak and apply the incorrect-answer penalty

---

## Test Focus
This role supports the following tests:

- Quiz trigger test
- Correct answer evaluation test
- Incorrect answer penalty test
- Streak increment / reset test
- Score calculation test
- Difficulty scaling test
- Question selection / no-repeat test

---

## Integration Notes
This module is intended to connect with:

- **Game Mechanics Engineer** — checkpoint events, color changes, gameplay effects
- **Backend / Database Engineer** — question storage, categories, high scores
- **UI/UX Integrator** — quiz popup, buttons, score display, effects

---

## Current Scope Decision
To keep the project realistic and low-risk for class delivery:

- Single-player only
- 2–3 quiz categories
- Checkpoint-based quiz trigger
- No real-time multiplayer logic in this role

---

## Author
**Quoc Hiep Huynh**  
Role 2 — Quiz System & Game Logic Engineer  
COMSC 380 – Intro Software Engineering Project

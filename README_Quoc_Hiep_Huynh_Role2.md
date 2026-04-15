# Quoc Hiep Huynh — Role 2: Quiz System & Game Logic Engineer

## Overview
This folder contains my contribution for **Role 2: Quiz System & Game Logic Engineer** in our COMSC 380 project.

My responsibility is to design and implement the **quiz flow and rule-based game logic** that connects the checkpoint system, question handling, answer evaluation, rewards/penalties, combo multipliers, and score progression.

---

## Responsibilities
I am responsible for:

- Triggering quiz events at checkpoints
- Displaying and managing multiple-choice questions
- Evaluating answers as correct or incorrect
- Applying rewards and penalties
- Managing combo multipliers / streak logic
- Supporting difficulty scaling for quiz questions
- Providing testable, modular logic for integration with the main game

---

## Main Features Implemented

### 1. Quiz Trigger Logic
- Quiz appears when a checkpoint condition is met
- Trigger rule can be configured depending on final team design

### 2. Question Management
- Supports multiple-choice questions
- Supports categories and difficulty levels
- Prevents repeated questions when possible

### 3. Answer Evaluation
- Checks whether the selected answer is correct
- Returns a result object that can be used by the frontend/game layer

### 4. Reward / Penalty System
Examples:
- Correct answer -> keep same color / bonus score / streak increase
- Incorrect answer -> change color / streak reset / penalty effect

### 5. Combo / Streak Logic
- Tracks consecutive correct answers
- Applies combo multiplier or bonus rule

### 6. Score Calculation
- Adds quiz-based score bonus
- Supports extension for distance-based score from gameplay module

### 7. Difficulty Scaling
- Supports increasing question difficulty based on progress/checkpoints

---

## Files / Modules

### Core Java Logic
- `Question.java` — question model
- `QuizResult.java` — result returned after answer evaluation
- `QuizEngine.java` — question selection and quiz flow
- `ScoreEngine.java` — score, streak, combo, and penalty logic
- `DifficultyManager.java` — scaling rules
- `TestHarness.java` — simple test runner for core logic

### Optional Spring Boot Scaffold
- REST-ready structure for future backend integration
- Can be connected to frontend if the team decides to use a Java service

---

## Design Goals
This part of the project was designed to be:

- **Modular** — easy to integrate with frontend and gameplay modules
- **Testable** — each rule can be verified independently
- **Traceable** — requirements map clearly to implementation
- **Simple enough for class scope** — avoids overengineering

---

## Example Rule Flow
1. Player reaches checkpoint
2. System triggers quiz
3. Player selects answer
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
This role supports the following types of tests:

- Quiz trigger test
- Correct answer evaluation test
- Incorrect answer penalty test
- Streak increment / reset test
- Score calculation test
- Difficulty scaling test
- Question selection / no-repeat test

---

## Integration Notes
This logic is intended to connect with:

- **Game Mechanics Engineer** — checkpoint events, color changes, gameplay effects
- **Backend / Database Engineer** — question storage, categories, scores
- **UI/UX Integrator** — quiz popup, answer buttons, score display

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

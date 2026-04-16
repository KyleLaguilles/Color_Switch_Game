import { useState, useEffect, useRef } from 'react';
import { COLORS, randomColor } from '../constants/colors';
import { PHASE } from '../constants/phases';
import QuizModal from './QuizModal';

// ── Canvas constants ────────────────────────────────────────────────
const CANVAS_W      = 140;
const CANVAS_H      = 380;
const TUBE_X        = 20;
const TUBE_W        = 100;
const BALL_RADIUS   = 14;
const BALL_STRIDE   = 32;
const TUBE_BOTTOM_Y = CANVAS_H - 20;
const DROP_SPEED    = 10;
const MAX_BALLS     = 10;
const CORNER_R      = 14;

// ── Small inline components ─────────────────────────────────────────
function MainMenu({ onStart }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 w-full max-w-sm">
      <h1 className="text-4xl font-extrabold text-white tracking-tight">
        Color<span className="text-[#e74c3c]">Switch</span>
      </h1>
      <p className="text-gray-400 text-sm text-center leading-relaxed">
        Answer trivia questions to control the tube. Stack 3 balls of the same
        color to clear them. Don&apos;t let the tube fill up!
      </p>

      <div className="bg-[#16213e] rounded-2xl p-5 w-full text-sm text-gray-300 space-y-2 border border-white/10">
        <p className="font-semibold text-white mb-1">How to play</p>
        <p>✅ Correct answer → choose which color drops</p>
        <p>❌ Wrong answer → random color drops</p>
        <p>🎯 3 same colors in a row → they clear (+50 pts)</p>
        <p>💀 Tube fills to {MAX_BALLS} balls → game over</p>
      </div>

      <div className="flex gap-2">
        {COLORS.map(c => (
          <div
            key={c.name}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base"
            style={{ backgroundColor: c.hex, color: c.text }}
          >
            {c.shape}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="bg-[#e74c3c] hover:bg-[#c0392b] active:scale-95 text-white font-bold
                   text-lg px-10 py-3 rounded-full transition-all duration-150 shadow-lg"
      >
        Start Game
      </button>
    </div>
  );
}

function ColorPicker({ onPick }) {
  return (
    <div className="bg-[#16213e] rounded-2xl p-4 border border-white/10 w-full">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 text-center">
        Pick your ball color
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {COLORS.map(color => (
          <button
            key={color.name}
            onClick={() => onPick(color)}
            aria-label={`Pick ${color.name}`}
            className="w-12 h-12 rounded-full border-4 border-white/20 hover:border-white/80
                       flex items-center justify-center text-xl font-bold
                       transition-all duration-150 hover:scale-110 active:scale-95"
            style={{ backgroundColor: color.hex, color: color.text }}
          >
            {color.shape}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameOverScreen({ score, onPlayAgain, onMenu }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 w-full max-w-sm">
      <h2 className="text-3xl font-extrabold text-red-400">Game Over</h2>
      <p className="text-gray-400 text-sm">The tube overflowed!</p>
      <div className="bg-[#16213e] rounded-2xl px-12 py-6 text-center border border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Final Score</p>
        <p className="text-5xl font-extrabold text-white">{score}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onPlayAgain}
          className="bg-[#e74c3c] hover:bg-[#c0392b] active:scale-95 text-white
                     font-bold px-8 py-2.5 rounded-full transition-all duration-150"
        >
          Play Again
        </button>
        <button
          onClick={onMenu}
          className="bg-[#16213e] hover:bg-[#1a2a4a] active:scale-95 text-gray-300
                     font-semibold px-8 py-2.5 rounded-full border border-white/10 transition-all duration-150"
        >
          Menu
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function TubeGame({ getNextQuestion }) {
  // ── React state (drives Tailwind UI) ──────────────────────────────
  const [phase, setPhase]                     = useState(PHASE.MENU);
  const [score, setScore]                     = useState(0);
  const [streak, setStreak]                   = useState(0);
  const [ballCount, setBallCount]             = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [pendingColor, setPendingColor]       = useState(null);
  const [feedback, setFeedback]               = useState(null);

  // ── Refs (mutable game data, safe inside rAF) ─────────────────────
  const canvasRef         = useRef(null);
  const tubeRef           = useRef([]);
  const scoreRef          = useRef(0);
  const streakRef         = useRef(0);
  const pendingRef        = useRef(null);
  const animRef           = useRef(null);
  const dropAnimRef       = useRef(null);     // { color, y, targetY }
  const popParticlesRef   = useRef([]);       // [{ x, y, color, progress }]
  const onDropCompleteRef = useRef(null);
  const feedbackTimerRef  = useRef(null);

  // ── Feedback helper ────────────────────────────────────────────────
  function showFeedback(text, good) {
    setFeedback({ text, good });
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 1800);
  }

  // ── Match-3 algorithm ──────────────────────────────────────────────
  function checkAndPopTriple() {
    const tube = tubeRef.current;
    if (tube.length < 3) return;
    const top = tube.slice(-3);
    if (top[0].name === top[1].name && top[1].name === top[2].name) {
      // Capture Y positions before removing so the pop animation knows where to burst
      const baseI = tube.length - 3;
      top.forEach((color, j) => {
        popParticlesRef.current.push({
          x:        CANVAS_W / 2,
          y:        TUBE_BOTTOM_Y - (baseI + j) * BALL_STRIDE,
          color,
          progress: 0,
        });
      });

      tubeRef.current = tube.slice(0, -3);
      scoreRef.current += 50;
      setScore(scoreRef.current);
      showFeedback('Triple! +50', true);
      checkAndPopTriple(); // cascade
    }
  }

  // ── Drop completion ────────────────────────────────────────────────
  function onDropComplete() {
    const color = dropAnimRef.current?.color;
    dropAnimRef.current = null;
    if (!color) return;

    tubeRef.current.push(color);
    checkAndPopTriple();
    setBallCount(tubeRef.current.length);

    if (tubeRef.current.length >= MAX_BALLS) {
      setPhase(PHASE.GAME_OVER);
      return;
    }

    const q = getNextQuestion();
    setCurrentQuestion(q);
    const nextColor = tubeRef.current.length > 0
      ? tubeRef.current[tubeRef.current.length - 1]
      : randomColor();
    pendingRef.current = nextColor;
    setPendingColor(nextColor);
    setPhase(PHASE.QUESTION);
  }

  useEffect(() => {
    onDropCompleteRef.current = onDropComplete;
  });

  // ── Canvas rendering ───────────────────────────────────────────────
  // The canvas element is ALWAYS in the DOM (just hidden via CSS when not
  // playing), so this effect finds a valid ref on the very first mount.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function drawBall(x, y, color, radius = BALL_RADIUS) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color.hex;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = color.text;
      ctx.font = `bold ${Math.round(radius * 0.85)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(color.shape, x, y);
    }

    function drawFrame() {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const ballsInTube = tubeRef.current.length;
      const danger      = ballsInTube >= MAX_BALLS - 2;
      const tubeRight   = TUBE_X + TUBE_W;

      // Tube interior fill (closed path so fill covers the rounded bottom)
      ctx.beginPath();
      ctx.moveTo(TUBE_X, 0);
      ctx.lineTo(TUBE_X, CANVAS_H - CORNER_R);
      ctx.arcTo(TUBE_X, CANVAS_H, TUBE_X + CORNER_R, CANVAS_H, CORNER_R);
      ctx.lineTo(tubeRight - CORNER_R, CANVAS_H);
      ctx.arcTo(tubeRight, CANVAS_H, tubeRight, CANVAS_H - CORNER_R, CORNER_R);
      ctx.lineTo(tubeRight, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 12, 0.5)';
      ctx.fill();

      // Tube wall stroke (open — no top cap)
      let wallColor = '#c8c8d8';
      if (danger) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 130);
        wallColor = `rgb(${Math.round(220 + 35 * pulse)}, 60, 60)`;
      }
      ctx.beginPath();
      ctx.moveTo(TUBE_X, 0);
      ctx.lineTo(TUBE_X, CANVAS_H - CORNER_R);
      ctx.arcTo(TUBE_X, CANVAS_H, TUBE_X + CORNER_R, CANVAS_H, CORNER_R);
      ctx.lineTo(tubeRight - CORNER_R, CANVAS_H);
      ctx.arcTo(tubeRight, CANVAS_H, tubeRight, CANVAS_H - CORNER_R, CORNER_R);
      ctx.lineTo(tubeRight, 0);
      ctx.strokeStyle = wallColor;
      ctx.lineWidth = danger ? 4 : 3;
      ctx.stroke();

      // Stacked balls (0 = bottom)
      for (let i = 0; i < ballsInTube; i++) {
        drawBall(CANVAS_W / 2, TUBE_BOTTOM_Y - i * BALL_STRIDE, tubeRef.current[i]);
      }

      // Dropping ball animation
      const anim = dropAnimRef.current;
      if (anim) {
        anim.y += DROP_SPEED;
        drawBall(CANVAS_W / 2, anim.y, anim.color);
        if (anim.y >= anim.targetY) {
          onDropCompleteRef.current?.();
        }
      }

      // Pop animation: each cleared ball expands and fades out
      const POP_SPEED = 0.055; // ~18 frames ≈ 300 ms at 60 fps
      const alive = [];
      for (const p of popParticlesRef.current) {
        p.progress += POP_SPEED;
        if (p.progress < 1) {
          ctx.save();
          ctx.globalAlpha = 1 - p.progress;
          drawBall(p.x, p.y, p.color, BALL_RADIUS * (1 + p.progress * 1.4));
          ctx.restore();
          alive.push(p);
        }
      }
      popParticlesRef.current = alive;

      animRef.current = requestAnimationFrame(drawFrame);
    }

    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Game logic handlers ────────────────────────────────────────────
  function startGame() {
    tubeRef.current         = [];
    scoreRef.current        = 0;
    streakRef.current       = 0;
    dropAnimRef.current     = null;
    popParticlesRef.current = [];
    setScore(0);
    setStreak(0);
    setBallCount(0);
    setFeedback(null);

    const firstColor = randomColor();
    pendingRef.current = firstColor;
    setPendingColor(firstColor);

    const q = getNextQuestion();
    setCurrentQuestion(q);
    setPhase(PHASE.QUESTION);
  }

  function triggerDrop(color) {
    dropAnimRef.current = {
      color,
      y: -BALL_RADIUS,
      targetY: TUBE_BOTTOM_Y - tubeRef.current.length * BALL_STRIDE,
    };
    setPhase(PHASE.DROPPING);
  }

  function handleCorrectAnswer() {
    streakRef.current += 1;
    const bonus = 10 + streakRef.current * 2;
    scoreRef.current += bonus;
    setStreak(streakRef.current);
    setScore(scoreRef.current);
    showFeedback(`Correct! +${bonus}`, true);
    setPhase(PHASE.CORRECT);
  }

  function handleWrongAnswer() {
    streakRef.current = 0;
    setStreak(0);
    showFeedback('Wrong!', false);
    const wrongColor = randomColor(pendingRef.current?.name);
    pendingRef.current = wrongColor;
    setPendingColor(wrongColor);
    triggerDrop(wrongColor);
  }

  function handleColorPicked(color) {
    pendingRef.current = color;
    setPendingColor(color);
    triggerDrop(color);
  }

  // ── Render ─────────────────────────────────────────────────────────
  const isPlaying = phase === PHASE.QUESTION
                 || phase === PHASE.CORRECT
                 || phase === PHASE.DROPPING;

  return (
    <div className="w-full flex flex-col items-center px-4 py-6">

      {phase === PHASE.MENU && <MainMenu onStart={startGame} />}

      {phase === PHASE.GAME_OVER && (
        <GameOverScreen
          score={score}
          onPlayAgain={startGame}
          onMenu={() => setPhase(PHASE.MENU)}
        />
      )}

      {/*
        Game UI — always rendered in the DOM tree so the canvas ref is valid
        from the very first mount. The `hidden` class (display:none) keeps the
        canvas in the DOM without it being visible during MENU / GAME_OVER.
      */}
      <div className={`w-full max-w-2xl flex flex-col items-center gap-4${isPlaying ? '' : ' hidden'}`}>

        {/* HUD */}
        <div className="flex justify-between w-full text-sm">
          <span className="bg-[#16213e] text-gray-200 px-4 py-1.5 rounded-full border border-white/10">
            Score <strong className="text-white">{score}</strong>
          </span>
          <span className={`px-4 py-1.5 rounded-full font-semibold border ${
            ballCount >= MAX_BALLS - 2
              ? 'bg-red-900/60 text-red-300 border-red-500/50 animate-pulse'
              : 'bg-[#16213e] text-gray-200 border-white/10'
          }`}>
            Balls <strong className="text-white">{ballCount}</strong>/{MAX_BALLS}
          </span>
          <span className="bg-[#16213e] text-gray-200 px-4 py-1.5 rounded-full border border-white/10">
            Streak <strong className="text-yellow-300">{streak}</strong>
          </span>
        </div>

        {/* Two-column area: [left = question/picker] [right = tube] */}
        <div className="flex items-start gap-4 w-full">

          {/* LEFT column */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {feedback && (
              <div className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${
                feedback.good
                  ? 'text-green-300 bg-green-400/10 border-green-500/30'
                  : 'text-red-300 bg-red-400/10 border-red-500/30'
              }`}>
                {feedback.text}
              </div>
            )}

            {streak >= 2 && (
              <div className="text-xs text-yellow-300 bg-yellow-400/10 border border-yellow-500/20 px-3 py-1 rounded-xl">
                {streak >= 3 ? '🔥' : '⚡'} {streak}× streak bonus
              </div>
            )}

            {phase === PHASE.QUESTION && (
              <QuizModal
                question={currentQuestion}
                onCorrect={handleCorrectAnswer}
                onWrong={handleWrongAnswer}
              />
            )}

            {phase === PHASE.CORRECT && (
              <ColorPicker onPick={handleColorPicked} />
            )}

            {phase === PHASE.DROPPING && (
              <div className="bg-[#16213e] rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-gray-400 text-sm">Ball dropping…</p>
              </div>
            )}
          </div>

          {/* RIGHT column — pending ball + canvas */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            {pendingColor && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Top of tube</span>
                <div
                  className="w-12 h-12 rounded-full border-4 border-dashed border-white/30
                             flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: pendingColor.hex, color: pendingColor.text }}
                >
                  {pendingColor.shape}
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="rounded-b-2xl"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

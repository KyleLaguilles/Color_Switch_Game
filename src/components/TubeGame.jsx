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

const DISPLAY_FONT = "'Big Shoulders Display', sans-serif";
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

// ── Background falling-balls canvas (start screen only) ─────────────
function BallsBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    const canvas = bgRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function makeBall(w, h, randomY = false) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x:       Math.random() * w,
        y:       randomY ? Math.random() * h : -(15 + Math.random() * 35),
        radius:  15 + Math.random() * 20,
        color:   color.hex,
        speed:   0.4 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.13,
      };
    }

    const balls = Array.from({ length: 18 }, () =>
      makeBall(window.innerWidth, window.innerHeight, true)
    );

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const ball of balls) {
        ball.y += ball.speed;
        ctx.save();
        ctx.globalAlpha = ball.opacity;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.restore();
        if (ball.y - ball.radius > canvas.height) {
          Object.assign(ball, makeBall(canvas.width, canvas.height, false));
        }
      }
      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={bgRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Color-cycling "COLOR" letters ────────────────────────────────────
const COLOR_LETTERS = ['C', 'O', 'L', 'O', 'R'];

function AnimatedTitle() {
  return (
    <h1
      className="text-7xl font-black tracking-tight leading-none uppercase"
      style={{ fontFamily: DISPLAY_FONT }}
    >
      {COLOR_LETTERS.map((letter, i) => (
        <span
          key={i}
          className="color-letter"
          style={{ animationDelay: `${-(i * 0.8).toFixed(1)}s` }}
        >
          {letter}
        </span>
      ))}
      <span style={{ color: 'var(--accent)' }}>Switch</span>
    </h1>
  );
}

// ── Small inline components ─────────────────────────────────────────
function MainMenu({ onStart }) {
  return (
    <div
      className="flex flex-col items-center gap-8 py-8 w-full max-w-sm"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="text-center">
        <AnimatedTitle />
        <p
          className="text-xs tracking-[0.25em] uppercase mt-2"
          style={{ color: 'var(--muted)' }}
        >
          Tube Challenge
        </p>
      </div>

      <div
        className="rounded-xl p-5 w-full text-sm border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--accent)' }}
        >
          How to play
        </p>
        <div className="space-y-2" style={{ color: 'var(--muted)' }}>
          <p>
            <span className="font-bold mr-2" style={{ color: 'var(--success)' }}>+</span>
            Correct answer → choose which color drops
          </p>
          <p>
            <span className="font-bold mr-2" style={{ color: 'var(--danger)' }}>×</span>
            Wrong answer → random color drops
          </p>
          <p>
            <span className="font-bold mr-2" style={{ color: 'var(--accent)' }}>◆</span>
            3 same colors in a row → clear them (+50 pts)
          </p>
          <p>
            <span className="font-bold mr-2 opacity-30">■</span>
            Tube fills to {MAX_BALLS} balls → game over
          </p>
        </div>
      </div>

      <div className="flex gap-3" aria-label="Ball colors in play" role="list">
        {COLORS.map(c => (
          <div
            key={c.name}
            role="listitem"
            aria-label={c.name}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base"
            style={{ backgroundColor: c.hex, color: c.text }}
          >
            {c.shape}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className={`active:scale-95 font-black text-xl px-12 py-3 rounded-lg
                    transition-all duration-150 hover:brightness-110 tracking-wider ${FOCUS}`}
        style={{ backgroundColor: 'var(--accent)', color: '#000', fontFamily: DISPLAY_FONT }}
      >
        START GAME
      </button>
    </div>
  );
}

function ColorPicker({ onPick }) {
  return (
    <div
      className="rounded-xl p-4 border w-full"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3 text-center"
        style={{ color: 'var(--accent)' }}
      >
        Pick your color
      </p>
      <div className="flex flex-wrap gap-3 justify-center" role="group" aria-label="Color choices">
        {COLORS.map(color => (
          <button
            key={color.name}
            onClick={() => onPick(color)}
            aria-label={`Pick ${color.name}`}
            className={`w-12 h-12 rounded-full border-4 border-white/20 hover:border-white/80
                        flex items-center justify-center text-xl font-bold
                        transition-all duration-150 hover:scale-110 active:scale-95 ${FOCUS}`}
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
    <div className="flex flex-col items-center gap-8 py-10 w-full max-w-sm text-center">
      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-2"
          style={{ color: 'var(--danger)' }}
        >
          Game Over
        </p>
        <h2
          className="text-5xl font-black uppercase"
          style={{ fontFamily: DISPLAY_FONT, color: 'var(--text)' }}
        >
          Tube Overflow
        </h2>
      </div>

      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-1"
          style={{ color: 'var(--muted)' }}
        >
          Final Score
        </p>
        <p
          className="text-8xl font-black leading-none"
          style={{ fontFamily: DISPLAY_FONT, color: 'var(--accent)' }}
          aria-label={`Final score: ${score}`}
        >
          {score}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPlayAgain}
          className={`active:scale-95 font-black text-lg px-8 py-2.5 rounded-lg
                      transition-all duration-150 hover:brightness-110 tracking-wider ${FOCUS}`}
          style={{ backgroundColor: 'var(--accent)', color: '#000', fontFamily: DISPLAY_FONT }}
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onMenu}
          className={`active:scale-95 font-semibold px-8 py-2.5 rounded-lg border
                      transition-all duration-150 hover:brightness-125 ${FOCUS}`}
          style={{ backgroundColor: 'var(--surface)', color: 'var(--muted)', borderColor: 'var(--border)' }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function TubeGame({ getNextQuestion }) {
  // ── React state ───────────────────────────────────────────────────
  const [phase, setPhase]                     = useState(PHASE.MENU);
  const [score, setScore]                     = useState(0);
  const [streak, setStreak]                   = useState(0);
  const [ballCount, setBallCount]             = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [pendingColor, setPendingColor]       = useState(null);
  const [feedback, setFeedback]               = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────
  const canvasRef         = useRef(null);
  const tubeRef           = useRef([]);
  const scoreRef          = useRef(0);
  const streakRef         = useRef(0);
  const pendingRef        = useRef(null);
  const animRef           = useRef(null);
  const dropAnimRef       = useRef(null);
  const popParticlesRef   = useRef([]);
  const onDropCompleteRef = useRef(null);
  const feedbackTimerRef  = useRef(null);
  const drawFrameRef      = useRef(null);  // stable ref for rAF restart

  const isPlaying = phase === PHASE.QUESTION
                 || phase === PHASE.CORRECT
                 || phase === PHASE.DROPPING;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

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
      const baseI = tube.length - 3;
      top.forEach((color, j) => {
        popParticlesRef.current.push({
          x: CANVAS_W / 2,
          y: TUBE_BOTTOM_Y - (baseI + j) * BALL_STRIDE,
          color,
          progress: 0,
        });
      });
      tubeRef.current = tube.slice(0, -3);
      scoreRef.current += 50;
      setScore(scoreRef.current);
      showFeedback('Triple! +50', true);
      checkAndPopTriple();
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
      // Pause the loop when nothing is animating and the game is not active
      if (!isPlayingRef.current && !dropAnimRef.current && !popParticlesRef.current.length) {
        animRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const ballsInTube = tubeRef.current.length;
      const danger      = ballsInTube >= MAX_BALLS - 2;
      const tubeRight   = TUBE_X + TUBE_W;

      ctx.beginPath();
      ctx.moveTo(TUBE_X, 0);
      ctx.lineTo(TUBE_X, CANVAS_H - CORNER_R);
      ctx.arcTo(TUBE_X, CANVAS_H, TUBE_X + CORNER_R, CANVAS_H, CORNER_R);
      ctx.lineTo(tubeRight - CORNER_R, CANVAS_H);
      ctx.arcTo(tubeRight, CANVAS_H, tubeRight, CANVAS_H - CORNER_R, CORNER_R);
      ctx.lineTo(tubeRight, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fill();

      let wallColor = 'rgba(255,255,255,0.5)';
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

      for (let i = 0; i < ballsInTube; i++) {
        drawBall(CANVAS_W / 2, TUBE_BOTTOM_Y - i * BALL_STRIDE, tubeRef.current[i]);
      }

      const anim = dropAnimRef.current;
      if (anim) {
        anim.y += DROP_SPEED;
        drawBall(CANVAS_W / 2, anim.y, anim.color);
        if (anim.y >= anim.targetY) {
          onDropCompleteRef.current?.();
        }
      }

      const POP_SPEED = 0.055;
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

    drawFrameRef.current = drawFrame;
    animRef.current = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restart the rAF loop when the game becomes active
  useEffect(() => {
    if (isPlaying && animRef.current === null && drawFrameRef.current) {
      animRef.current = requestAnimationFrame(drawFrameRef.current);
    }
  }, [isPlaying]);

  // ── Game logic ─────────────────────────────────────────────────────
  function goToMenu() {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    dropAnimRef.current     = null;
    popParticlesRef.current = [];
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setPhase(PHASE.MENU);
  }

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
  return (
    <div className="w-full flex flex-col items-center px-4 py-6">

      <BallsBackground />

      {phase === PHASE.MENU && <MainMenu onStart={startGame} />}

      {phase === PHASE.GAME_OVER && (
        <GameOverScreen
          score={score}
          onPlayAgain={startGame}
          onMenu={() => setPhase(PHASE.MENU)}
        />
      )}

      {/*
        Game UI is always in the DOM so the canvas ref stays valid.
        `hidden` keeps it out of view during MENU / GAME_OVER.
      */}
      <div className={`w-full max-w-2xl flex flex-col items-center gap-4${isPlaying ? '' : ' hidden'}`}>

        {/* Exit button */}
        <div className="w-full flex justify-start">
          <button
            onClick={goToMenu}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 hover:brightness-125 active:scale-95 ${FOCUS}`}
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ← Menu
          </button>
        </div>

        {/* HUD */}
        <div
          className="flex justify-between w-full text-sm"
          role="region"
          aria-label="Game stats"
        >
          <span
            className="px-4 py-1.5 rounded-lg border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Score{' '}
            <strong style={{ fontFamily: DISPLAY_FONT, fontSize: '1.1em' }}>{score}</strong>
          </span>

          <span
            className={`px-4 py-1.5 rounded-lg border font-semibold ${ballCount >= MAX_BALLS - 2 ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: ballCount >= MAX_BALLS - 2
                ? 'color-mix(in oklch, var(--danger) 20%, transparent)'
                : 'var(--surface)',
              color: ballCount >= MAX_BALLS - 2 ? 'oklch(80% 0.22 20)' : 'var(--text)',
              borderColor: ballCount >= MAX_BALLS - 2
                ? 'color-mix(in oklch, var(--danger) 50%, transparent)'
                : 'var(--border)',
            }}
            aria-live="polite"
            aria-label={`${ballCount} of ${MAX_BALLS} balls in tube`}
          >
            Balls{' '}
            <strong style={{ fontFamily: DISPLAY_FONT, fontSize: '1.1em' }}>{ballCount}</strong>
            /{MAX_BALLS}
          </span>

          <span
            className="px-4 py-1.5 rounded-lg border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Streak{' '}
            <strong
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: '1.1em',
                color: streak > 0 ? 'oklch(82% 0.19 90)' : 'var(--text)',
              }}
            >
              {streak}
            </strong>
          </span>
        </div>

        {/* Two-column area: stacked on mobile (canvas top), side-by-side on sm+ */}
        <div className="flex flex-col-reverse sm:flex-row items-start gap-4 w-full">

          {/* LEFT column — quiz / color picker */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* aria-live region for answer feedback */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {feedback && (
                <div
                  className="text-sm font-bold px-3 py-2 rounded-lg border"
                  style={{
                    color: feedback.good ? 'var(--success)' : 'var(--danger)',
                    backgroundColor: feedback.good
                      ? 'color-mix(in oklch, var(--success) 12%, transparent)'
                      : 'color-mix(in oklch, var(--danger) 12%, transparent)',
                    borderColor: feedback.good
                      ? 'color-mix(in oklch, var(--success) 35%, transparent)'
                      : 'color-mix(in oklch, var(--danger) 35%, transparent)',
                  }}
                >
                  {feedback.text}
                </div>
              )}
            </div>

            {streak >= 2 && (
              <div
                className="text-xs font-semibold px-3 py-1 rounded-lg border"
                style={{
                  color: 'oklch(82% 0.19 90)',
                  backgroundColor: 'oklch(82% 0.19 90 / 0.1)',
                  borderColor: 'oklch(82% 0.19 90 / 0.25)',
                }}
                aria-live="polite"
              >
                {streak}× STREAK BONUS
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
              <div
                className="rounded-xl p-4 border text-center"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                aria-live="polite"
              >
                <p style={{ color: 'var(--muted)' }} className="text-sm">Dropping…</p>
              </div>
            )}
          </div>

          {/* RIGHT column — next ball + canvas */}
          <div className="shrink-0 flex flex-col items-center gap-2 mx-auto sm:mx-0">
            {pendingColor && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Next
                </span>
                <div
                  className="w-10 h-10 rounded-full border-2 border-dashed border-white/30
                             flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: pendingColor.hex, color: pendingColor.text }}
                  aria-label={`Next ball: ${pendingColor.name}`}
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
              role="img"
              aria-label={`Tube: ${ballCount} of ${MAX_BALLS} balls stacked`}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

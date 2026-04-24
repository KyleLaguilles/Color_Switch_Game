import { useState, useEffect, useRef } from 'react';
import { COLORS, randomColor } from '../constants/colors';
import { PHASE } from '../constants/phases';
import QuizModal from './QuizModal';
import BallsBackground from './BallsBackground';
import SpillAnimation from './SpillAnimation';

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

// ── Color-cycling title ─────────────────────────────────────────────
const COLOR_LETTERS = ['C', 'O', 'L', 'O', 'R'];

function AnimatedTitle() {
  return (
    <div style={{ textAlign: 'center', lineHeight: 1 }}>
      <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: 28, letterSpacing: '0.05em', lineHeight: 1.25, marginBottom: 6 }}>
        {COLOR_LETTERS.map((letter, i) => (
          <span
            key={i}
            className="color-letter"
            style={{ animationDelay: `${-(i * 0.8).toFixed(1)}s` }}
          >
            {letter}
          </span>
        ))}
        <br />
        <span style={{ color: 'var(--text)' }}>SWITCH</span>
      </h1>
      <p style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: 8,
        color: 'var(--muted)',
        letterSpacing: '0.25em',
        marginTop: 8,
        animation: 'glowPulse 1.4s ease-in-out infinite',
      }}>
        TUBE CHALLENGE
      </p>
    </div>
  );
}

// ── Main Menu ───────────────────────────────────────────────────────
function MainMenu({ onStart, isGuest, onSignIn, onSignOut, onShowStats }) {
  return (
    <div
      className="flex flex-col items-center gap-8 py-8 w-full animate-scan-in"
      style={{ maxWidth: 380, position: 'relative', zIndex: 1 }}
    >
      {/* Auth shortcut */}
      {isGuest ? (
        <button type="button" onClick={onSignIn} className={`absolute top-0 right-0 btn-ghost ${FOCUS}`}
          style={{ fontSize: 10, padding: '5px 12px' }}>
          Sign in
        </button>
      ) : (
        <button type="button" onClick={onSignOut} className={`absolute top-0 right-0 btn-ghost ${FOCUS}`}
          style={{ fontSize: 10, padding: '5px 12px' }}>
          Sign out
        </button>
      )}

      {/* Title */}
      <AnimatedTitle />

      {/* Animated color balls */}
      <div style={{ display: 'flex', gap: 10 }} aria-label="Ball colors in play" role="list">
        {COLORS.map((c, i) => (
          <div
            key={c.name}
            role="listitem"
            aria-label={c.name}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: c.hex, color: c.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 'bold',
              boxShadow: `0 0 12px ${c.hex}88, 0 0 24px ${c.hex}44`,
              animation: `floatBall ${3 + i * 0.4}s ease-in-out ${-(i * 0.5)}s infinite`,
            }}
          >
            {c.shape}
          </div>
        ))}
      </div>

      {/* How to play card */}
      <div className="retro-card w-full" style={{ fontSize: 13 }}>
        <p style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 8,
          color: 'var(--accent)',
          letterSpacing: '0.12em',
          marginBottom: 14,
        }}>
          HOW TO PLAY
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, color: 'var(--muted)', lineHeight: 1.6 }}>
          <p><span style={{ color: 'var(--success)', fontWeight: 700, marginRight: 8 }}>✓</span>Correct answer → choose which color drops</p>
          <p><span style={{ color: 'var(--danger)', fontWeight: 700, marginRight: 8 }}>✕</span>Wrong answer → random color drops</p>
          <p><span style={{ color: 'var(--accent)', fontWeight: 700, marginRight: 8 }}>◆</span>3 same colors in a row → clear them (+50 pts)</p>
          <p><span style={{ opacity: 0.4, fontWeight: 700, marginRight: 8 }}>■</span>Tube fills to {MAX_BALLS} balls → game over</p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <button onClick={onStart} className={`btn-neon ${FOCUS}`}>
          START GAME
        </button>

        {!isGuest && (
          <button onClick={onShowStats} className={`btn-ghost ${FOCUS}`}>
            View Stats
          </button>
        )}
      </div>
    </div>
  );
}

// ── Color Picker ────────────────────────────────────────────────────
function ColorPicker({ onPick }) {
  return (
    <div className="neon-card animate-drop-in w-full" style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: 8,
        color: 'var(--accent)',
        letterSpacing: '0.12em',
        marginBottom: 14,
      }}>
        PICK YOUR COLOR
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}
        role="group" aria-label="Color choices">
        {COLORS.map(color => (
          <button
            key={color.name}
            onClick={() => onPick(color)}
            aria-label={`Pick ${color.name}`}
            className={`color-pick-btn ${FOCUS}`}
            style={{ background: color.hex, color: color.text }}
          >
            {color.shape}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Game Over ───────────────────────────────────────────────────────
function GameOverScreen({ score, onPlayAgain, onMenu, isGuest }) {
  return (
    <div className="flex flex-col items-center gap-8 py-10 w-full text-center animate-scan-in"
      style={{ maxWidth: 380 }}>
      <div>
        <p style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 10,
          color: 'var(--danger)',
          letterSpacing: '0.2em',
          marginBottom: 10,
          textShadow: '0 0 12px var(--danger)',
        }}>
          GAME OVER
        </p>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 52, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
          TUBE OVERFLOW
        </h2>
      </div>

      <div>
        <p style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 8,
          color: 'var(--muted)',
          letterSpacing: '0.15em',
          marginBottom: 8,
        }}>
          FINAL SCORE
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 96,
            fontWeight: 900,
            color: 'var(--accent)',
            lineHeight: 1,
            textShadow: '0 0 20px var(--accent), 0 0 40px rgba(241,196,15,0.5)',
          }}
          aria-label={`Final score: ${score}`}
        >
          {score}
        </p>
      </div>

      {isGuest && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginTop: -16 }}>
          Sign up to save your stats
        </p>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onPlayAgain} className={`btn-neon ${FOCUS}`}>
          PLAY AGAIN
        </button>
        <button onClick={onMenu} className={`btn-ghost ${FOCUS}`}>
          Menu
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function TubeGame({ getNextQuestion, isGuest = false, user = null, onSignIn, onSignOut, onGameOver, onShowStats }) {
  // ── React state ───────────────────────────────────────────────────
  const [phase, setPhase]                     = useState(PHASE.MENU);
  const [score, setScore]                     = useState(0);
  const [streak, setStreak]                   = useState(0);
  const [ballCount, setBallCount]             = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [pendingColor, setPendingColor]       = useState(null);
  const [feedback, setFeedback]               = useState(null);
  const [gameOverStage, setGameOverStage]     = useState(null); // null | 'shake' | 'spill'
  const [spillColors, setSpillColors]         = useState(null);
  const [spillRect,   setSpillRect]           = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────
  const canvasRef         = useRef(null);
  const gameOverTimersRef = useRef([]);
  const tubeRef           = useRef([]);
  const scoreRef          = useRef(0);
  const streakRef         = useRef(0);
  const pendingRef        = useRef(null);
  const animRef           = useRef(null);
  const dropAnimRef       = useRef(null);
  const popParticlesRef   = useRef([]);
  const onDropCompleteRef = useRef(null);
  const feedbackTimerRef  = useRef(null);
  const drawFrameRef      = useRef(null);
  const attemptsRef       = useRef([]);

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
      onGameOver?.(scoreRef.current, [...attemptsRef.current]);

      // Snapshot the tube state for the spill canvas before anything changes
      const r = canvasRef.current?.getBoundingClientRect();
      if (r) setSpillRect({ x: r.left, y: r.top, width: r.width, height: r.height });
      setSpillColors([...tubeRef.current]);

      setGameOverStage('shake');
      const t1 = setTimeout(() => setGameOverStage('spill'), 500);
      const t2 = setTimeout(() => {
        setGameOverStage(null);
        setSpillColors(null);
        setSpillRect(null);
        setPhase(PHASE.GAME_OVER);
      }, 2800); // 500ms shake + 2300ms spill
      gameOverTimersRef.current = [t1, t2];
      return; // phase stays DROPPING so canvas loop keeps running
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
      ctx.save();
      ctx.shadowColor = color.hex;
      ctx.shadowBlur  = 14;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color.hex;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(x - radius * 0.28, y - radius * 0.28, radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fill();

      ctx.fillStyle = color.text;
      ctx.font = `bold ${Math.round(radius * 0.85)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(color.shape, x, y);
    }

    function drawFrame() {
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

      let wallColor = 'rgba(255,255,255,0.18)';
      let wallWidth = 2;
      if (danger) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 130);
        wallColor = `rgba(231, ${Math.round(30 + 30 * pulse)}, 60, ${0.7 + 0.3 * pulse})`;
        wallWidth = 3;
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur  = 12 * pulse;
      }
      ctx.beginPath();
      ctx.moveTo(TUBE_X, 0);
      ctx.lineTo(TUBE_X, CANVAS_H - CORNER_R);
      ctx.arcTo(TUBE_X, CANVAS_H, TUBE_X + CORNER_R, CANVAS_H, CORNER_R);
      ctx.lineTo(tubeRight - CORNER_R, CANVAS_H);
      ctx.arcTo(tubeRight, CANVAS_H, tubeRight, CANVAS_H - CORNER_R, CORNER_R);
      ctx.lineTo(tubeRight, 0);
      ctx.strokeStyle = wallColor;
      ctx.lineWidth   = wallWidth;
      ctx.stroke();
      ctx.shadowBlur = 0;

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

  useEffect(() => {
    if (isPlaying && animRef.current === null && drawFrameRef.current) {
      animRef.current = requestAnimationFrame(drawFrameRef.current);
    }
  }, [isPlaying]);

  // ── Game logic ─────────────────────────────────────────────────────
  function goToMenu() {
    gameOverTimersRef.current.forEach(clearTimeout);
    gameOverTimersRef.current = [];
    setGameOverStage(null);
    setSpillColors(null);
    setSpillRect(null);
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
    gameOverTimersRef.current.forEach(clearTimeout);
    gameOverTimersRef.current = [];
    setGameOverStage(null);
    setSpillColors(null);
    setSpillRect(null);
    tubeRef.current         = [];
    scoreRef.current        = 0;
    streakRef.current       = 0;
    dropAnimRef.current     = null;
    popParticlesRef.current = [];
    attemptsRef.current     = [];
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
    attemptsRef.current.push({ category: currentQuestion?.category ?? null, was_correct: true });
    streakRef.current += 1;
    const bonus = 10 + streakRef.current * 2;
    scoreRef.current += bonus;
    setStreak(streakRef.current);
    setScore(scoreRef.current);
    showFeedback(`Correct! +${bonus}`, true);
    setPhase(PHASE.CORRECT);
  }

  function handleWrongAnswer() {
    attemptsRef.current.push({ category: currentQuestion?.category ?? null, was_correct: false });
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

  const danger = ballCount >= MAX_BALLS - 2;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col items-center px-4 py-6">

      <BallsBackground />

      {gameOverStage === 'spill' && spillColors && spillRect && (
        <SpillAnimation colors={spillColors} tubeRect={spillRect} />
      )}

      {phase === PHASE.MENU && (
        <MainMenu
          onStart={startGame}
          isGuest={isGuest}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          onShowStats={onShowStats}
        />
      )}

      {phase === PHASE.GAME_OVER && (
        <GameOverScreen
          score={score}
          onPlayAgain={startGame}
          onMenu={() => setPhase(PHASE.MENU)}
          isGuest={isGuest}
        />
      )}

      {/*
        Game UI always in the DOM so canvas ref stays valid.
        `hidden` keeps it out of view during MENU / GAME_OVER.
      */}
      <div className={`w-full flex flex-col items-center gap-4${isPlaying ? '' : ' hidden'}`}
        style={{ maxWidth: 520, position: 'relative', zIndex: 1 }}>

        {/* Exit button */}
        <div className="w-full flex justify-start" style={{
          opacity: gameOverStage ? 0 : 1,
          transition: 'opacity 0.2s ease',
          pointerEvents: gameOverStage ? 'none' : 'auto',
        }}>
          <button onClick={goToMenu} className={`btn-ghost ${FOCUS}`} style={{ fontSize: 11, padding: '6px 14px' }}>
            ← Menu
          </button>
        </div>

        {/* HUD */}
        <div className="flex justify-between w-full gap-2" role="region" aria-label="Game stats"
          style={{
            opacity: gameOverStage ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div className="hud-cell" style={{ flex: 1 }}>
            <span className="hud-label">SCORE</span>
            <span className="hud-value" style={{ color: 'var(--accent)' }}>{score}</span>
          </div>

          <div
            className="hud-cell"
            style={{
              flex: 1,
              animation: danger ? 'dangerPulse 0.7s ease-in-out infinite' : 'none',
              borderColor: danger ? 'rgba(231,76,60,0.4)' : 'var(--border)',
            }}
            aria-live="polite"
            aria-label={`${ballCount} of ${MAX_BALLS} balls in tube`}
          >
            <span className="hud-label">BALLS</span>
            <span className="hud-value" style={{ color: danger ? 'var(--danger)' : 'var(--text)' }}>
              {ballCount}<span style={{ fontSize: 9, color: 'var(--muted)' }}>/{MAX_BALLS}</span>
            </span>
          </div>

          <div className="hud-cell" style={{ flex: 1 }}>
            <span className="hud-label">STREAK</span>
            <span className="hud-value" style={{ color: streak > 1 ? '#f39c12' : 'var(--text)' }}>
              {streak}{streak > 1 ? '×' : ''}
            </span>
          </div>
        </div>

        {/* Two-column area */}
        <div className="flex flex-col-reverse sm:flex-row items-start gap-4 w-full">

          {/* LEFT: quiz / color picker */}
          <div className="flex-1 min-w-0 flex flex-col gap-3" style={{
            opacity: gameOverStage ? 0 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: gameOverStage ? 'none' : 'auto',
          }}>

            {/* Feedback toast */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {feedback && (
                <div
                  className="animate-drop-in"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 4,
                    border: `1px solid ${feedback.good ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)'}`,
                    background: feedback.good ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)',
                    color: feedback.good ? '#7fffc4' : '#ff9090',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: 9,
                    letterSpacing: '0.06em',
                  }}
                >
                  {feedback.text}
                </div>
              )}
            </div>

            {streak >= 2 && (
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 8,
                  color: '#f39c12',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  background: 'rgba(243,156,18,0.1)',
                  border: '1px solid rgba(243,156,18,0.3)',
                  borderRadius: 3,
                }}
                aria-live="polite"
              >
                🔥 {streak}× STREAK BONUS
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
                className="retro-card"
                style={{ textAlign: 'center', padding: '20px 14px' }}
                aria-live="polite"
              >
                <p style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 9,
                  color: 'var(--muted)',
                  letterSpacing: '0.1em',
                  animation: 'glowPulse 0.6s ease-in-out infinite',
                }}>
                  DROPPING...
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: next ball + canvas */}
          <div
            className={`shrink-0 flex flex-col items-center gap-2 mx-auto sm:mx-0${gameOverStage === 'shake' ? ' tube-shake' : ''}`}
            style={{ opacity: gameOverStage === 'spill' ? 0 : 1 }}
          >
            {pendingColor && (
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 7,
                  color: 'var(--muted)',
                  letterSpacing: '0.12em',
                  marginBottom: 6,
                }}>
                  NEXT
                </p>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: pendingColor.hex, color: pendingColor.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 'bold',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    boxShadow: `0 0 12px ${pendingColor.hex}88`,
                    margin: '0 auto',
                  }}
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
              style={{ borderRadius: '0 0 14px 14px', display: 'block', border: '1px solid rgba(255,255,255,0.07)' }}
              role="img"
              aria-label={`Tube: ${ballCount} of ${MAX_BALLS} balls stacked`}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

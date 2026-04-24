import { useEffect, useRef } from 'react';

// Must match TubeGame.jsx canvas constants exactly
const CANVAS_W    = 140;
const CANVAS_H    = 380;
const TUBE_X      = 20;
const TUBE_W      = 100;
const BALL_BOTTOM = CANVAS_H - 20; // TUBE_BOTTOM_Y
const BALL_STRIDE = 32;
const BALL_R      = 14;
const CORNER_R    = 14;

function easeInCubic(t) { return t * t * t; }

export default function SpillAnimation({ colors, tubeRect }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    // Pivot: bottom-center of the tube canvas element in screen space.
    // This is the point that stays fixed while the tube rotates left.
    const pivotX = tubeRect.x + CANVAS_W / 2;
    const pivotY = tubeRect.y + CANVAS_H;
    const floorY = pivotY;

    const TIP_MS   = 1000; // tube fall duration
    const TOTAL_MS = 2200; // total animation (must be < timeout in TubeGame)

    // Rotate a tube-local point into screen space at a given tube angle
    function toWorld(localX, localY, angle) {
      const dx = localX - CANVAS_W / 2; // relative to pivot column
      const dy = localY - CANVAS_H;     // relative to floor
      return {
        x: pivotX + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: pivotY + dx * Math.sin(angle) + dy * Math.cos(angle),
      };
    }

    // Build ball state — index 0 = bottom of tube, last = top.
    // Top balls are near the opening so they're more likely to spill out.
    const balls = colors.map((color, i) => {
      const localX  = CANVAS_W / 2;
      const localY  = BALL_BOTTOM - i * BALL_STRIDE;
      const frac    = i / Math.max(colors.length - 1, 1); // 0=bottom, 1=top
      return {
        color, localX, localY,
        willEscape:  Math.random() < 0.25 + 0.75 * frac,
        // Angle (negative) at which this ball escapes — top balls earlier
        escapeAngle: -(Math.PI / 2) * (0.22 + 0.55 * frac),
        escaped: false,
        x: 0, y: 0, vx: 0, vy: 0,
      };
    });

    const GRAVITY  = 0.42;
    const BOUNCE   = 0.28;  // energy kept per floor bounce
    const FRICTION = 0.988; // per-frame horizontal damping

    // ── Draw helpers ────────────────────────────────────────────────

    function drawBall(x, y, color) {
      ctx.save();
      ctx.shadowColor = color.hex;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = color.hex;
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(x - BALL_R * 0.28, y - BALL_R * 0.28, BALL_R * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fill();
      ctx.fillStyle    = color.text;
      ctx.font         = `bold ${Math.round(BALL_R * 0.85)}px sans-serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(color.shape, x, y);
    }

    function applyTubeTransform(angle) {
      ctx.translate(pivotX, pivotY);
      ctx.rotate(angle);
      ctx.translate(-pivotX, -pivotY);
    }

    function drawTubeFill(angle) {
      const tx = tubeRect.x + TUBE_X, ty = tubeRect.y, tr = tx + TUBE_W;
      ctx.save();
      applyTubeTransform(angle);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty + CANVAS_H - CORNER_R);
      ctx.arcTo(tx, ty + CANVAS_H, tx + CORNER_R, ty + CANVAS_H, CORNER_R);
      ctx.lineTo(tr - CORNER_R, ty + CANVAS_H);
      ctx.arcTo(tr, ty + CANVAS_H, tr, ty + CANVAS_H - CORNER_R, CORNER_R);
      ctx.lineTo(tr, ty);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fill();
      ctx.restore();
    }

    function drawTubeWalls(angle) {
      const tx = tubeRect.x + TUBE_X, ty = tubeRect.y, tr = tx + TUBE_W;
      ctx.save();
      applyTubeTransform(angle);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty + CANVAS_H - CORNER_R);
      ctx.arcTo(tx, ty + CANVAS_H, tx + CORNER_R, ty + CANVAS_H, CORNER_R);
      ctx.lineTo(tr - CORNER_R, ty + CANVAS_H);
      ctx.arcTo(tr, ty + CANVAS_H, tr, ty + CANVAS_H - CORNER_R, CORNER_R);
      ctx.lineTo(tr, ty);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth   = 3;
      ctx.shadowColor = '#e74c3c';
      ctx.shadowBlur  = 10;
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.restore();
    }

    function drawFloor() {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth   = 2;
      ctx.shadowColor = 'rgba(255,255,255,0.12)';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(canvas.width, floorY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // ── Animation loop ──────────────────────────────────────────────

    const t0 = performance.now();
    let id;

    function frame(now) {
      const elapsed = now - t0;
      if (elapsed >= TOTAL_MS) { cancelAnimationFrame(id); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tipT  = Math.min(elapsed / TIP_MS, 1);
      const angle = -(Math.PI / 2) * easeInCubic(tipT);

      drawFloor();

      // Pass 1 — escaped balls (physics), drawn behind the tube
      for (const b of balls) {
        if (!b.escaped) continue;

        b.vy += GRAVITY;
        b.vx *= FRICTION;
        b.x  += b.vx;
        b.y  += b.vy;

        if (b.y + BALL_R >= floorY) {
          b.y   = floorY - BALL_R;
          b.vy *= -BOUNCE;
          b.vx *= 0.88; // extra friction on floor contact
          if (Math.abs(b.vy) < 0.8) b.vy = 0;
        }

        if (b.x + BALL_R > 0) drawBall(b.x, b.y, b.color);
      }

      // Pass 2 — tube fill (covers escaped balls that are still near the opening)
      drawTubeFill(angle);

      // Pass 3 — in-tube balls, drawn on top of the fill so they appear inside
      for (const b of balls) {
        if (b.escaped) continue;
        const pos = toWorld(b.localX, b.localY, angle);

        if (b.willEscape && angle <= b.escapeAngle) {
          // Ball breaks free — start physics from current screen position
          b.escaped = true;
          b.x  = pos.x;
          b.y  = pos.y;
          b.vx = -(1.5 + Math.random() * 3.5); // rolling left
          b.vy = -(Math.random() * 5.5);        // slight upward ejection
        } else {
          drawBall(pos.x, pos.y, b.color);
        }
      }

      // Pass 4 — tube walls on top of everything (in-tube balls appear behind walls)
      drawTubeWalls(angle);

      id = requestAnimationFrame(frame);
    }

    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}
    />
  );
}

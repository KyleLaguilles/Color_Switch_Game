import { useEffect, useRef } from 'react';
import { COLORS } from '../constants/colors';

export default function BallsBackground() {
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

import { useState, useEffect } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFF_COLORS = {
  easy:   { color: 'var(--success)', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.4)' },
  medium: { color: '#f39c12',        bg: 'rgba(243,156,18,0.12)',  border: 'rgba(243,156,18,0.4)' },
  hard:   { color: 'var(--danger)',  bg: 'rgba(231,76,60,0.12)',   border: 'rgba(231,76,60,0.4)'  },
};

const ANSWER_KEYS = ['A', 'B', 'C', 'D'];

export default function QuizModal({ question, onCorrect, onWrong }) {
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selected, setSelected]               = useState(null);
  const [revealed, setRevealed]               = useState(false);

  useEffect(() => {
    if (!question) return;
    setShuffledAnswers(shuffle([question.correct_answer, ...question.incorrect_answers]));
    setSelected(null);
    setRevealed(false);
  }, [question]);

  if (!question) return null;

  function handleSelect(answer) {
    if (revealed) return;
    setSelected(answer);
    setRevealed(true);
    const isCorrect = answer === question.correct_answer;
    setTimeout(() => {
      isCorrect ? onCorrect() : onWrong();
    }, 900);
  }

  function getAnswerOverride(answer) {
    if (!revealed) return {};
    if (answer === question.correct_answer) {
      return {
        borderColor: '#2ecc71',
        background: 'rgba(46,204,113,0.12)',
        color: '#7fffc4',
        boxShadow: '0 0 10px rgba(46,204,113,0.3)',
      };
    }
    if (answer === selected) {
      return {
        borderColor: '#e74c3c',
        background: 'rgba(231,76,60,0.12)',
        color: '#ff9090',
        boxShadow: '0 0 10px rgba(231,76,60,0.3)',
      };
    }
    return { opacity: 0.35 };
  }

  const diff = DIFF_COLORS[question.difficulty] ?? DIFF_COLORS.medium;

  return (
    <div
      className="retro-card animate-drop-in w-full"
      role="region"
      aria-label="Trivia question"
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 10,
          color: 'var(--muted)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginRight: 8,
        }}>
          {question.category}
        </span>
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 7,
          padding: '3px 8px',
          background: diff.bg,
          color: diff.color,
          border: `1px solid ${diff.border}`,
          borderRadius: 3,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          {question.difficulty}
        </span>
      </div>

      {/* Question text */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        lineHeight: 1.6,
        color: 'var(--text)',
        fontWeight: 600,
        marginBottom: 14,
      }}>
        {question.question}
      </p>

      {/* Answer buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }} role="group" aria-label="Answer choices">
        {shuffledAnswers.map((answer, i) => (
          <button
            key={answer}
            onClick={() => handleSelect(answer)}
            disabled={revealed}
            aria-label={
              revealed && answer === question.correct_answer ? `${answer} — correct`
              : revealed && answer === selected ? `${answer} — incorrect`
              : answer
            }
            className="answer-btn"
            style={getAnswerOverride(answer)}
          >
            <span className="answer-key">{ANSWER_KEYS[i]}</span>
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
}

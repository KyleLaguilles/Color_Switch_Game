import { useState, useEffect } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY = {
  easy:   { color: 'var(--success)',                                    bg: 'color-mix(in oklch, var(--success) 12%, transparent)'  },
  medium: { color: 'oklch(82% 0.19 90)',                                bg: 'oklch(82% 0.19 90 / 0.12)'                             },
  hard:   { color: 'var(--danger)',                                     bg: 'color-mix(in oklch, var(--danger) 12%, transparent)'   },
};

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

// Inline card — parent controls when this is mounted.
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

  function getAnswerStyle(answer) {
    if (!revealed) {
      return {
        backgroundColor: 'var(--raised)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
      };
    }
    if (answer === question.correct_answer) {
      return {
        backgroundColor: 'color-mix(in oklch, var(--success) 18%, transparent)',
        borderColor: 'color-mix(in oklch, var(--success) 65%, transparent)',
        color: 'oklch(82% 0.14 148)',
      };
    }
    if (answer === selected) {
      return {
        backgroundColor: 'color-mix(in oklch, var(--danger) 18%, transparent)',
        borderColor: 'color-mix(in oklch, var(--danger) 65%, transparent)',
        color: 'oklch(78% 0.16 20)',
      };
    }
    return {
      backgroundColor: 'transparent',
      borderColor: 'oklch(100% 0 0 / 0.05)',
      color: 'var(--muted)',
      opacity: '0.45',
    };
  }

  const diff = DIFFICULTY[question.difficulty] ?? DIFFICULTY.medium;

  return (
    <div
      className="rounded-xl p-4 border shadow-xl w-full"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      role="region"
      aria-label="Trivia question"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs uppercase tracking-widest truncate mr-2"
          style={{ color: 'var(--muted)' }}
        >
          {question.category}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
          style={{ color: diff.color, backgroundColor: diff.bg }}
        >
          {question.difficulty}
        </span>
      </div>

      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--text)' }}
      >
        {question.question}
      </p>

      <div
        className="flex flex-col gap-2"
        role="group"
        aria-label="Answer choices"
      >
        {shuffledAnswers.map(answer => (
          <button
            key={answer}
            onClick={() => handleSelect(answer)}
            aria-disabled={revealed ? 'true' : undefined}
            aria-label={
              revealed && answer === question.correct_answer
                ? `${answer} — correct`
                : revealed && answer === selected
                ? `${answer} — incorrect`
                : answer
            }
            className={`border-2 rounded-xl px-3 py-2.5 text-sm font-medium
                        transition-all duration-200 w-full text-left ${FOCUS}
                        ${!revealed ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}
            style={getAnswerStyle(answer)}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
}

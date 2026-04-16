import { useState, useEffect } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY_COLORS = {
  easy:   'text-green-400 bg-green-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  hard:   'text-red-400 bg-red-400/10',
};

// Inline card — no overlay. Parent controls when this is mounted.
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

  function getButtonClass(answer) {
    const base = 'border-2 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 w-full text-left';
    if (!revealed) {
      return `${base} bg-[#0f3460] border-[#1a5276] text-white hover:bg-[#1a5276] hover:border-[#2980b9]`;
    }
    if (answer === question.correct_answer) {
      return `${base} bg-green-800 border-green-400 text-white`;
    }
    if (answer === selected) {
      return `${base} bg-red-800 border-red-400 text-white`;
    }
    return `${base} bg-[#0f3460]/40 border-[#1a5276]/40 text-white/40`;
  }

  const diffClass = DIFFICULTY_COLORS[question.difficulty] ?? 'text-gray-400 bg-gray-400/10';

  return (
    <div className="bg-[#16213e] rounded-2xl p-4 border border-white/10 shadow-xl w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider truncate mr-2">
          {question.category}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${diffClass}`}>
          {question.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-100 leading-relaxed mb-4">
        {question.question}
      </p>

      <div className="flex flex-col gap-2">
        {shuffledAnswers.map((answer, i) => (
          <button
            key={i}
            onClick={() => handleSelect(answer)}
            className={getButtonClass(answer)}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
}

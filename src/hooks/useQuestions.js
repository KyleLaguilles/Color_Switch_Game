import { useState, useEffect, useRef, useCallback } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useQuestions() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Use refs for the pool and index so getNextQuestion never goes stale.
  const poolRef  = useRef([]);
  const indexRef = useRef(0);

  useEffect(() => {
    fetch('/questions.json')
      .then(r => r.json())
      .then(data => {
        poolRef.current  = shuffle(data.questions);
        indexRef.current = 0;
        setLoading(false);
      })
      .catch(err => setError(err.message));
  }, []);

  // Stable reference — safe to call from rAF closures without a stale-closure risk.
  const getNextQuestion = useCallback(() => {
    const pool = poolRef.current;
    if (pool.length === 0) return null;

    const q = pool[indexRef.current];
    indexRef.current += 1;

    if (indexRef.current >= pool.length) {
      poolRef.current  = shuffle(pool);
      indexRef.current = 0;
    }

    return q;
  }, []); // no deps — reads/writes refs directly

  return { loading, error, getNextQuestion };
}

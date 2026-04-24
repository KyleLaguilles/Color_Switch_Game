import { useState, useEffect, useRef, useCallback } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeDifficulty(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  return ['easy', 'medium', 'hard'].includes(v) ? v : null;
}

function nextFromPool(poolRef, indexRef) {
  const pool = poolRef.current;
  if (!pool.length) return null;

  const item = pool[indexRef.current];
  indexRef.current += 1;

  if (indexRef.current >= pool.length) {
    poolRef.current = shuffle(pool);
    indexRef.current = 0;
  }

  return item;
}

export function useQuestions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allPoolRef = useRef([]);
  const allIndexRef = useRef(0);

  const easyPoolRef = useRef([]);
  const mediumPoolRef = useRef([]);
  const hardPoolRef = useRef([]);

  const easyIndexRef = useRef(0);
  const mediumIndexRef = useRef(0);
  const hardIndexRef = useRef(0);

  useEffect(() => {
    fetch('/questions.json')
      .then((r) => r.json())
      .then((data) => {
        const questions = data.questions ?? [];

        allPoolRef.current = shuffle(questions);
        allIndexRef.current = 0;

        easyPoolRef.current = shuffle(
          questions.filter((q) => normalizeDifficulty(q.difficulty) === 'easy')
        );
        mediumPoolRef.current = shuffle(
          questions.filter((q) => normalizeDifficulty(q.difficulty) === 'medium')
        );
        hardPoolRef.current = shuffle(
          questions.filter((q) => normalizeDifficulty(q.difficulty) === 'hard')
        );

        easyIndexRef.current = 0;
        mediumIndexRef.current = 0;
        hardIndexRef.current = 0;

        setLoading(false);
      })
      .catch((err) => setError(err.message));
  }, []);

  const getNextQuestion = useCallback((difficulty = null) => {
    const level = normalizeDifficulty(difficulty);

    if (!level) {
      return nextFromPool(allPoolRef, allIndexRef);
    }

    if (level === 'easy' && easyPoolRef.current.length) {
      return nextFromPool(easyPoolRef, easyIndexRef);
    }

    if (level === 'medium' && mediumPoolRef.current.length) {
      return nextFromPool(mediumPoolRef, mediumIndexRef);
    }

    if (level === 'hard' && hardPoolRef.current.length) {
      return nextFromPool(hardPoolRef, hardIndexRef);
    }

    return nextFromPool(allPoolRef, allIndexRef);
  }, []);

  return { loading, error, getNextQuestion };
}
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useQuestions } from './hooks/useQuestions';
import TubeGame from './components/TubeGame';
import Auth from './components/Auth';
import StatsScreen from './components/StatsScreen';
import MyQuestionSetsScreen from './components/MyQuestionSetsScreen';
import CreateQuestionSetScreen from './components/CreateQuestionSetScreen';
import EditQuestionSetScreen from './components/EditQuestionSetScreen';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillDistractors(questions) {
  const correctAnswers = questions.map((q) => q.correct_answer);
  return questions.map((q) => {
    const existing = q.incorrect_answers ?? [];
    if (existing.length >= 3) return q;
    const pool = shuffle(
      correctAnswers.filter((a) => a !== q.correct_answer && !existing.includes(a))
    );
    return { ...q, incorrect_answers: [...existing, ...pool.slice(0, 3 - existing.length)] };
  });
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = resolving
  const [isGuest, setIsGuest] = useState(false);
  const [screen, setScreen]   = useState('game');    // 'game' | 'stats' | 'my-sets' | 'create-set'
  const [customSetFn, setCustomSetFn] = useState(null);
  const [activeSetName, setActiveSetName] = useState(null);
  const [editingSetId, setEditingSetId] = useState(null);
  const { loading, error, getNextQuestion } = useQuestions();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setIsGuest(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handlePlayCustomSet(setId, setName) {
    const { data: rows } = await supabase
      .from('questions')
      .select('*')
      .eq('set_id', setId);
    const filled = fillDistractors(rows ?? []);
    let pool = shuffle(filled);
    let idx = 0;
    const fn = () => {
      if (!pool.length) return null;
      const q = pool[idx++];
      if (idx >= pool.length) { pool = shuffle([...pool]); idx = 0; }
      return q;
    };
    setCustomSetFn(() => fn);
    setActiveSetName(setName);
    setScreen('game');
  }

  async function handleGameOver(finalScore, attempts) {
    if (isGuest || !session?.user) return;
    const userId = session.user.id;

    const { data: sessionRow } = await supabase
      .from('game_sessions')
      .insert({ user_id: userId, score: finalScore, mode: activeSetName ?? 'classic' })
      .select('id')
      .single();

    if (sessionRow && attempts.length > 0) {
      await supabase.from('question_attempts').insert(
        attempts.map(a => ({
          user_id:     userId,
          question_id: a.question_id ?? null,
          category:    a.category,
          was_correct: a.was_correct,
        }))
      );
    }
  }

  if (session === undefined || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg"
           style={{ color: 'var(--muted)' }}>
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center text-base"
           style={{ color: 'var(--danger)' }}>
        Failed to load questions: {error}
      </div>
    );
  }

  if (!session && !isGuest) {
    return <Auth onGuest={() => setIsGuest(true)} />;
  }

  if (screen === 'stats' && session?.user) {
    return (
      <StatsScreen
        user={session.user}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (screen === 'my-sets' && session?.user) {
    return (
      <MyQuestionSetsScreen
        user={session.user}
        onBack={() => { setCustomSetFn(null); setActiveSetName(null); setScreen('game'); }}
        onPlay={handlePlayCustomSet}
        onEdit={(setId) => { setEditingSetId(setId); setScreen('edit-set'); }}
        onCreateNew={() => setScreen('create-set')}
      />
    );
  }

  if (screen === 'create-set' && session?.user) {
    return (
      <CreateQuestionSetScreen
        user={session.user}
        onBack={() => setScreen('my-sets')}
      />
    );
  }

  if (screen === 'edit-set' && session?.user && editingSetId) {
    return (
      <EditQuestionSetScreen
        user={session.user}
        setId={editingSetId}
        onDone={() => setScreen('my-sets')}
      />
    );
  }

  const effectiveGetNextQuestion = customSetFn ?? getNextQuestion;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <TubeGame
        getNextQuestion={effectiveGetNextQuestion}
        isGuest={isGuest}
        user={session?.user ?? null}
        onSignIn={() => setIsGuest(false)}
        onSignOut={() => supabase.auth.signOut()}
        onGameOver={handleGameOver}
        onShowStats={() => setScreen('stats')}
        onShowMySets={() => setScreen('my-sets')}
      />
    </div>
  );
}

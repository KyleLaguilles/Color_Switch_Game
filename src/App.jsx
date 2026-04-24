import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useQuestions } from './hooks/useQuestions';
import TubeGame from './components/TubeGame';
import Auth from './components/Auth';
import StatsScreen from './components/StatsScreen';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = resolving
  const [isGuest, setIsGuest] = useState(false);
  const [screen, setScreen]   = useState('game');    // 'game' | 'stats'
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

  async function handleGameOver(finalScore, attempts) {
    if (isGuest || !session?.user) return;
    const userId = session.user.id;

    const { data: sessionRow } = await supabase
      .from('game_sessions')
      .insert({ user_id: userId, score: finalScore, mode: 'classic' })
      .select('id')
      .single();

    if (sessionRow && attempts.length > 0) {
      await supabase.from('question_attempts').insert(
        attempts.map(a => ({
          user_id:    userId,
          question_id: null,
          category:   a.category,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <TubeGame
        getNextQuestion={getNextQuestion}
        isGuest={isGuest}
        user={session?.user ?? null}
        onSignIn={() => setIsGuest(false)}
        onSignOut={() => supabase.auth.signOut()}
        onGameOver={handleGameOver}
        onShowStats={() => setScreen('stats')}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import BallsBackground from './BallsBackground';

export default function MyQuestionSetsScreen({ user, onBack, onPlay, onEdit, onCreateNew }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const loadSets = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('question_sets')
      .select('id, name, created_at, questions(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setSets(data ?? []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { loadSets(); }, [loadSets]);

  async function handleDelete(setId) {
    setDeletingId(setId);
    await supabase.from('question_sets').delete().eq('id', setId);
    setDeletingId(null);
    loadSets();
  }

  async function handlePlay(setId, setName) {
    setPlayingId(setId);
    await onPlay(setId, setName);
    setPlayingId(null);
  }

  const questionCount = (set) => set.questions?.[0]?.count ?? 0;

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center px-4 py-6 game-scroll animate-scan-in"
      style={{ position: 'relative' }}
    >
      <BallsBackground />

      <div className="w-full flex flex-col gap-6" style={{ maxWidth: 400, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <button onClick={onBack} className="btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }}>
            ← Back
          </button>
          <h2 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 11,
            color: 'var(--text)',
            letterSpacing: '0.08em',
            flex: 1,
          }}>
            MY SETS
          </h2>
          <button onClick={onCreateNew} className="btn-neon" style={{ fontSize: 10, padding: '7px 14px' }}>
            + Create New
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 9,
            color: 'var(--muted)',
            textAlign: 'center',
            padding: '48px 0',
            animation: 'glowPulse 1.2s ease-in-out infinite',
          }}>
            LOADING...
          </p>
        )}

        {/* Empty state */}
        {!loading && sets.length === 0 && (
          <div className="retro-card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text)', marginBottom: 8 }}>
              NO SETS YET
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>
              Create your first question set to play with custom trivia.
            </p>
          </div>
        )}

        {/* Sets list */}
        {!loading && sets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sets.map((set) => {
              const count = questionCount(set);
              const isDeleting = deletingId === set.id;
              const isPlaying = playingId === set.id;
              return (
                <div
                  key={set.id}
                  className="retro-card"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}
                >
                  {/* Set info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 4,
                    }}>
                      {set.name}
                    </p>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: 7,
                      color: 'var(--accent)',
                      letterSpacing: '0.06em',
                    }}>
                      {count} {count === 1 ? 'QUESTION' : 'QUESTIONS'}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handlePlay(set.id, set.name)}
                      disabled={isPlaying || isDeleting || count === 0}
                      className="btn-neon"
                      style={{ fontSize: 10, padding: '5px 12px', opacity: count === 0 ? 0.4 : 1 }}
                    >
                      {isPlaying ? '...' : 'Play'}
                    </button>
                    <button
                      onClick={() => onEdit(set.id)}
                      disabled={isDeleting || isPlaying}
                      className="btn-ghost"
                      style={{ fontSize: 10, padding: '5px 12px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(set.id)}
                      disabled={isDeleting || isPlaying}
                      className="btn-ghost"
                      style={{ fontSize: 10, padding: '5px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      {isDeleting ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

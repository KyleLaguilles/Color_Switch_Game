import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import BallsBackground from './BallsBackground';

const DISPLAY_FONT = "'Big Shoulders Display', sans-serif";
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

function StatCard({ label, value, sub }) {
  return (
    <div
      className="rounded-xl p-4 text-center flex flex-col items-center gap-1"
      style={{ background: 'var(--raised)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="text-3xl font-black leading-none" style={{ fontFamily: DISPLAY_FONT, color: 'var(--accent)' }}>
        {value}
      </p>
      {sub && <p className="text-xs" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  );
}

function PctBar({ pct }) {
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--danger)';
  return (
    <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--raised)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color, transition: 'width 0.4s ease' }}
      />
    </div>
  );
}

export default function StatsScreen({ user, onBack }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const [{ data: sessions }, { data: attempts }] = await Promise.all([
        supabase.from('game_sessions').select('score').eq('user_id', user.id),
        supabase.from('question_attempts').select('category, was_correct').eq('user_id', user.id),
      ]);

      const allSessions = sessions ?? [];
      const total     = allSessions.length;
      const highScore = total > 0 ? Math.max(...allSessions.map(s => s.score)) : 0;
      const avgScore  = total > 0
        ? Math.round(allSessions.reduce((s, r) => s + r.score, 0) / total)
        : 0;

      const allAttempts = attempts ?? [];
      const totalQ   = allAttempts.length;
      const correctQ = allAttempts.filter(a => a.was_correct).length;
      const overallPct = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;

      const catMap = {};
      for (const a of allAttempts) {
        const key = a.category ?? 'Unknown';
        if (!catMap[key]) catMap[key] = { total: 0, correct: 0 };
        catMap[key].total++;
        if (a.was_correct) catMap[key].correct++;
      }
      const categories = Object.entries(catMap)
        .map(([name, { total, correct }]) => ({
          name,
          total,
          correct,
          pct: Math.round((correct / total) * 100),
        }))
        .sort((a, b) => b.total - a.total);

      setStats({ total, highScore, avgScore, overallPct, totalQ, correctQ, categories });
      setLoading(false);
    }

    load();
  }, [user.id]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-6 overflow-y-auto">
      <BallsBackground />

      <div className="w-full max-w-sm flex flex-col gap-6" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onBack}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all hover:brightness-125 active:scale-95 ${FOCUS}`}
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ← Back
          </button>
          <h2
            className="text-2xl font-black uppercase tracking-wider"
            style={{ fontFamily: DISPLAY_FONT, color: 'var(--text)' }}
          >
            Your Stats
          </h2>
        </div>

        {loading && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--muted)' }}>Loading…</p>
        )}

        {!loading && stats.total === 0 && (
          <div
            className="rounded-xl p-8 text-center border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>No games yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Play a game to see your stats here.
            </p>
          </div>
        )}

        {!loading && stats.total > 0 && (
          <>
            {/* Summary grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Games Played" value={stats.total} />
              <StatCard label="High Score"   value={stats.highScore} />
              <StatCard label="Avg Score"    value={stats.avgScore} />
              <StatCard
                label="Correct"
                value={`${stats.overallPct}%`}
                sub={`${stats.correctQ} / ${stats.totalQ} answered`}
              />
            </div>

            {/* Category breakdown */}
            {stats.categories.length > 0 && (
              <div
                className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest px-4 pt-4 pb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  By Category
                </p>
                <div className="flex flex-col">
                  {stats.categories.map((cat, i) => (
                    <div
                      key={cat.name}
                      className="px-4 py-3 flex flex-col gap-2"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                          {cat.name}
                        </span>
                        <span className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--muted)' }}>
                          {cat.correct}/{cat.total} · {cat.pct}%
                        </span>
                      </div>
                      <PctBar pct={cat.pct} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom padding so last item clears the screen */}
            <div className="h-6" />
          </>
        )}
      </div>
    </div>
  );
}

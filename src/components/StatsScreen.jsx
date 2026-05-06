import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import BallsBackground from './BallsBackground';

function StatCard({ label, value, sub }) {
  return (
    <div className="neon-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span className="hud-label">{label}</span>
      <span className="hud-value" style={{ color: 'var(--accent)', fontSize: 22 }}>{value}</span>
      {sub && <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--muted)' }}>{sub}</p>}
    </div>
  );
}

function PctBar({ pct }) {
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--danger)';
  return (
    <div style={{ height: 6, width: '100%', borderRadius: 3, background: 'var(--raised)' }}>
      <div
        style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: color, transition: 'width 0.4s ease' }}
      />
    </div>
  );
}

export default function StatsScreen({ user, onBack }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const [{ data: sessions }, { data: attempts }, { data: customSets }, { data: customQs }] = await Promise.all([
        supabase.from('game_sessions').select('score, mode').eq('user_id', user.id),
        supabase.from('question_attempts').select('category, was_correct, question_id').eq('user_id', user.id),
        supabase.from('question_sets').select('id, name').eq('user_id', user.id),
        supabase.from('questions').select('id, set_id').eq('user_id', user.id).eq('is_default', false),
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
          name, total, correct,
          pct: Math.round((correct / total) * 100),
        }))
        .sort((a, b) => b.total - a.total);

      // Custom set stats
      const qidToSetId = {};
      for (const q of (customQs ?? [])) qidToSetId[q.id] = q.set_id;

      const setIdToName = {};
      for (const s of (customSets ?? [])) setIdToName[s.id] = s.name;

      const setNameToPlays = {};
      for (const s of (customSets ?? [])) setNameToPlays[s.name] = 0;
      for (const sess of allSessions) {
        if (sess.mode && sess.mode !== 'classic' && Object.prototype.hasOwnProperty.call(setNameToPlays, sess.mode)) {
          setNameToPlays[sess.mode]++;
        }
      }

      const setIdToAttempts = {};
      for (const a of allAttempts) {
        if (a.question_id && qidToSetId[a.question_id]) {
          const sid = qidToSetId[a.question_id];
          if (!setIdToAttempts[sid]) setIdToAttempts[sid] = { total: 0, correct: 0 };
          setIdToAttempts[sid].total++;
          if (a.was_correct) setIdToAttempts[sid].correct++;
        }
      }

      const customSetStats = (customSets ?? [])
        .map((s) => {
          const plays = setNameToPlays[s.name] ?? 0;
          const att = setIdToAttempts[s.id] ?? { total: 0, correct: 0 };
          const pct = att.total > 0 ? Math.round((att.correct / att.total) * 100) : null;
          return { id: s.id, name: s.name, plays, total: att.total, correct: att.correct, pct };
        })
        .filter((s) => s.plays > 0 || s.total > 0)
        .sort((a, b) => b.plays - a.plays);

      setStats({ total, highScore, avgScore, overallPct, totalQ, correctQ, categories, customSetStats, hasCustomSets: (customSets ?? []).length > 0 });
      setLoading(false);
    }

    load();
  }, [user.id]);

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
            fontSize: 14,
            color: 'var(--text)',
            letterSpacing: '0.08em',
          }}>
            YOUR STATS
          </h2>
        </div>

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

        {!loading && stats.total === 0 && (
          <div className="retro-card" style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: 'var(--text)', marginBottom: 8 }}>
              NO GAMES YET
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>
              Play a game to see your stats here.
            </p>
          </div>
        )}

        {!loading && stats.total > 0 && (
          <>
            {/* Summary grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard label="GAMES PLAYED" value={stats.total} />
              <StatCard label="HIGH SCORE"   value={stats.highScore} />
              <StatCard label="AVG SCORE"    value={stats.avgScore} />
              <StatCard
                label="CORRECT"
                value={`${stats.overallPct}%`}
                sub={`${stats.correctQ} / ${stats.totalQ} answered`}
              />
            </div>

            {/* Category breakdown */}
            {stats.categories.length > 0 && (
              <div className="retro-card" style={{ padding: 0, overflow: 'hidden' }}>
                <p style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 8,
                  color: 'var(--accent)',
                  letterSpacing: '0.12em',
                  padding: '14px 16px 10px',
                }}>
                  BY CATEGORY
                </p>
                <div>
                  {stats.categories.map((cat, i) => (
                    <div
                      key={cat.name}
                      style={{
                        padding: '10px 16px',
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                        <span style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {cat.name}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: 7,
                          color: 'var(--muted)',
                          flexShrink: 0,
                        }}>
                          {cat.correct}/{cat.total} · {cat.pct}%
                        </span>
                      </div>
                      <PctBar pct={cat.pct} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom set stats */}
            {stats.hasCustomSets && (
              <div className="retro-card" style={{ padding: 0, overflow: 'hidden' }}>
                <p style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 8,
                  color: 'var(--accent)',
                  letterSpacing: '0.12em',
                  padding: '14px 16px 10px',
                }}>
                  BY QUESTION SET
                </p>

                {stats.customSetStats.length === 0 && (
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    color: 'var(--muted)',
                    padding: '0 16px 16px',
                    fontStyle: 'italic',
                  }}>
                    No custom sets played yet.
                  </p>
                )}

                {stats.customSetStats.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '10px 16px',
                      borderTop: i > 0 ? '1px solid var(--border)' : '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {s.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: 7,
                        color: 'var(--muted)',
                        flexShrink: 0,
                      }}>
                        {s.plays} {s.plays === 1 ? 'play' : 'plays'}
                        {s.pct !== null && ` · ${s.pct}%`}
                      </span>
                    </div>
                    {s.pct !== null && <PctBar pct={s.pct} />}
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 24 }} />
          </>
        )}
      </div>
    </div>
  );
}

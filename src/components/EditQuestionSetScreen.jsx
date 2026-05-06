import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import BallsBackground from './BallsBackground';

const EMPTY_FORM = { question: '', correct_answer: '', inc1: '', inc2: '', inc3: '' };

function InputField({ label, value, onChange, placeholder, optional }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: 7,
        color: optional ? 'var(--muted)' : 'var(--accent)',
        letterSpacing: '0.08em',
      }}>
        {label}{optional && <span style={{ color: 'var(--muted)', marginLeft: 6 }}>(optional)</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'var(--raised)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '8px 12px',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
      />
    </div>
  );
}

export default function EditQuestionSetScreen({ user, setId, onDone }) {
  const [setName, setSetName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: setRow }, { data: qs }] = await Promise.all([
      supabase.from('question_sets').select('name').eq('id', setId).single(),
      supabase.from('questions').select('id, question, correct_answer, incorrect_answers')
        .eq('set_id', setId).order('created_at', { ascending: true }),
    ]);
    if (setRow) {
      setSetName(setRow.name);
      setOriginalName(setRow.name);
    }
    setQuestions(qs ?? []);
    setLoading(false);
  }, [setId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDeleteQuestion(questionId) {
    setDeletingId(questionId);
    await supabase.from('questions').delete().eq('id', questionId);
    setDeletingId(null);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }

  function handleFormChange(field) {
    return (val) => setForm((f) => ({ ...f, [field]: val }));
  }

  const canAddQuestion = form.question.trim() !== '' && form.correct_answer.trim() !== '';

  async function handleAddQuestion() {
    if (!canAddQuestion) return;
    setAddingQuestion(true);
    setError(null);
    const incorrect = [form.inc1, form.inc2, form.inc3].map((s) => s.trim()).filter(Boolean);
    const { data: newQ, error: qErr } = await supabase
      .from('questions')
      .insert({
        set_id: setId,
        user_id: user.id,
        question: form.question.trim(),
        correct_answer: form.correct_answer.trim(),
        incorrect_answers: incorrect,
        is_default: false,
      })
      .select('id, question, correct_answer, incorrect_answers')
      .single();

    if (qErr) {
      setError(qErr.message);
    } else {
      setQuestions((prev) => [...prev, newQ]);
      setForm(EMPTY_FORM);
    }
    setAddingQuestion(false);
  }

  async function handleDone() {
    setSaving(true);
    setError(null);
    const trimmed = setName.trim();
    if (trimmed && trimmed !== originalName) {
      const { error: nameErr } = await supabase
        .from('question_sets')
        .update({ name: trimmed })
        .eq('id', setId);
      if (nameErr) {
        setError(nameErr.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    onDone();
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center px-4 py-6 game-scroll animate-scan-in"
      style={{ position: 'relative' }}
    >
      <BallsBackground />

      <div className="w-full flex flex-col gap-6" style={{ maxWidth: 400, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <h2 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 10,
            color: 'var(--text)',
            letterSpacing: '0.08em',
            flex: 1,
          }}>
            EDIT SET
          </h2>
          <button
            onClick={handleDone}
            disabled={saving || !setName.trim()}
            className="btn-neon"
            style={{ fontSize: 10, padding: '7px 18px', opacity: setName.trim() && !saving ? 1 : 0.4 }}
          >
            {saving ? '...' : 'Done'}
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

        {!loading && (
          <>
            {/* Set name */}
            <div className="neon-card">
              <InputField
                label="SET NAME"
                value={setName}
                onChange={setSetName}
                placeholder="Set name..."
              />
            </div>

            {/* Existing questions */}
            <div className="retro-card" style={{ padding: 0, overflow: 'hidden' }}>
              <p style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 8,
                color: 'var(--accent)',
                letterSpacing: '0.12em',
                padding: '14px 16px 10px',
              }}>
                QUESTIONS ({questions.length})
              </p>

              {questions.length === 0 && (
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'var(--muted)',
                  padding: '0 16px 16px',
                  fontStyle: 'italic',
                }}>
                  No questions yet. Add one below.
                </p>
              )}

              {questions.map((q, i) => {
                const isDeleting = deletingId === q.id;
                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '10px 16px',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text)',
                        marginBottom: 3,
                        lineHeight: 1.4,
                      }}>
                        {i + 1}. {q.question}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--success)' }}>
                        ✓ {q.correct_answer}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={isDeleting}
                      className="btn-ghost"
                      style={{
                        fontSize: 10,
                        padding: '3px 8px',
                        color: 'var(--danger)',
                        borderColor: 'var(--danger)',
                        flexShrink: 0,
                        opacity: isDeleting ? 0.5 : 1,
                      }}
                    >
                      {isDeleting ? '...' : 'Delete'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add question form */}
            <div className="retro-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 8,
                color: 'var(--accent)',
                letterSpacing: '0.12em',
              }}>
                ADD A QUESTION
              </p>

              <InputField
                label="QUESTION"
                value={form.question}
                onChange={handleFormChange('question')}
                placeholder="Enter the question..."
              />
              <InputField
                label="CORRECT ANSWER"
                value={form.correct_answer}
                onChange={handleFormChange('correct_answer')}
                placeholder="The right answer..."
              />
              <InputField
                label="INCORRECT ANSWER 1"
                value={form.inc1}
                onChange={handleFormChange('inc1')}
                placeholder="Wrong option..."
                optional
              />
              <InputField
                label="INCORRECT ANSWER 2"
                value={form.inc2}
                onChange={handleFormChange('inc2')}
                placeholder="Wrong option..."
                optional
              />
              <InputField
                label="INCORRECT ANSWER 3"
                value={form.inc3}
                onChange={handleFormChange('inc3')}
                placeholder="Wrong option..."
                optional
              />

              <button
                onClick={handleAddQuestion}
                disabled={!canAddQuestion || addingQuestion}
                className="btn-ghost"
                style={{
                  fontSize: 11,
                  padding: '8px 0',
                  width: '100%',
                  opacity: canAddQuestion && !addingQuestion ? 1 : 0.4,
                }}
              >
                {addingQuestion ? 'Adding...' : '+ Add Question'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--danger)',
                textAlign: 'center',
              }}>
                {error}
              </p>
            )}
          </>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

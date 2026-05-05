import { useState } from 'react';
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

export default function CreateQuestionSetScreen({ user, onBack }) {
  const [setName, setSetName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canAddQuestion = form.question.trim() !== '' && form.correct_answer.trim() !== '';
  const canSave = setName.trim() !== '' && questions.length > 0;

  function handleFormChange(field) {
    return (val) => setForm((f) => ({ ...f, [field]: val }));
  }

  function handleAddQuestion() {
    if (!canAddQuestion) return;
    const incorrect = [form.inc1, form.inc2, form.inc3]
      .map((s) => s.trim())
      .filter(Boolean);
    setQuestions((prev) => [
      ...prev,
      {
        question: form.question.trim(),
        correct_answer: form.correct_answer.trim(),
        incorrect_answers: incorrect,
      },
    ]);
    setForm(EMPTY_FORM);
  }

  function handleRemoveQuestion(idx) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    const { data: newSet, error: setErr } = await supabase
      .from('question_sets')
      .insert({ user_id: user.id, name: setName.trim() })
      .select('id')
      .single();

    if (setErr) {
      setError(setErr.message);
      setSaving(false);
      return;
    }

    const rows = questions.map((q) => ({
      set_id: newSet.id,
      user_id: user.id,
      question: q.question,
      correct_answer: q.correct_answer,
      incorrect_answers: q.incorrect_answers,
      is_default: false,
    }));

    const { error: qErr } = await supabase.from('questions').insert(rows);

    if (qErr) {
      setError(qErr.message);
      setSaving(false);
      return;
    }

    onBack();
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
          <button onClick={onBack} className="btn-ghost" style={{ fontSize: 11, padding: '6px 14px' }}>
            ← Back
          </button>
          <h2 style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 10,
            color: 'var(--text)',
            letterSpacing: '0.08em',
          }}>
            CREATE SET
          </h2>
        </div>

        {/* Set name */}
        <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <InputField
            label="SET NAME"
            value={setName}
            onChange={setSetName}
            placeholder="e.g. Science Quiz"
          />
        </div>

        {/* Question entry form */}
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
            disabled={!canAddQuestion}
            className="btn-ghost"
            style={{
              fontSize: 11,
              padding: '8px 0',
              width: '100%',
              opacity: canAddQuestion ? 1 : 0.4,
            }}
          >
            + Add Question
          </button>
        </div>

        {/* Question count */}
        {questions.length > 0 && (
          <p style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 8,
            color: 'var(--accent)',
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}>
            {questions.length} {questions.length === 1 ? 'QUESTION' : 'QUESTIONS'} ADDED
          </p>
        )}

        {/* Preview list */}
        {questions.length > 0 && (
          <div className="retro-card" style={{ padding: 0, overflow: 'hidden' }}>
            <p style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 7,
              color: 'var(--muted)',
              letterSpacing: '0.1em',
              padding: '12px 16px 8px',
            }}>
              PREVIEW
            </p>
            {questions.map((q, i) => (
              <div
                key={i}
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
                    {q.question}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 11,
                    color: 'var(--success)',
                  }}>
                    ✓ {q.correct_answer}
                  </p>
                  {q.incorrect_answers.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--muted)', fontStyle: 'italic' }}>
                      Distractors auto-filled at runtime
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveQuestion(i)}
                  className="btn-ghost"
                  style={{ fontSize: 10, padding: '3px 8px', color: 'var(--danger)', borderColor: 'var(--danger)', flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

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

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="btn-neon"
          style={{ opacity: canSave && !saving ? 1 : 0.4, width: '100%' }}
        >
          {saving ? 'SAVING...' : 'SAVE SET'}
        </button>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

import { useQuestions } from './hooks/useQuestions';
import TubeGame from './components/TubeGame';

export default function App() {
  const { loading, error, getNextQuestion } = useQuestions();

  if (loading) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <TubeGame getNextQuestion={getNextQuestion} />
    </div>
  );
}

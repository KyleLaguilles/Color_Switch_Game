import { useQuestions } from './hooks/useQuestions';
import TubeGame from './components/TubeGame';

export default function App() {
  const { loading, error, getNextQuestion } = useQuestions();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-white text-lg">
        Loading questions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center text-red-400 text-base px-6 text-center">
        Failed to load questions: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center">
      <TubeGame getNextQuestion={getNextQuestion} />
    </div>
  );
}

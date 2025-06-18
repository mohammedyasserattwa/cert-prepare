import type { JSX } from 'react';
import { type ExamQuestionType } from './ExamPrep';

interface MissedEntry {
  question: ExamQuestionType;
  chosen: string | null;
}

interface ExamResultsProps {
  questions: ExamQuestionType[];
  score: { correct: number; wrong: number };
  answersHistory: MissedEntry[];
  showReview: boolean;
  missedQuestions: MissedEntry[];
  handleReviewMissed: () => void;
  cancelSession: () => void;
  questionFormatter: (q: string) => (JSX.Element | null)[];
  answerFormatter: (a: string) => JSX.Element;
}

export function ExamResults({
  questions,
  score,
  answersHistory,
  showReview,
  missedQuestions,
  handleReviewMissed,
  cancelSession,
  questionFormatter,
  answerFormatter,
}: ExamResultsProps) {
  const total = questions.length;
  const correct = score.correct;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="min-h-full mt-12 md:mt-0 flex flex-col items-center justify-center bg-[#181d1c] px-2">
      <h1 className="text-2xl md:text-3xl font-bold mb-10 text-white text-center">Exam Results</h1>
      <div className="w-full max-w-4xl">
        <div className="bg-[#374140] rounded-xl px-4 md:px-8 py-4 md:py-6 mb-8 text-left">
          <div className="text-md text-gray-300">Score</div>
          <div className="text-2xl font-semibold text-white">{percent}%</div>
        </div>
        <div className="mb-6 text-left">
          <div className="font-semibold text-white mb-2">Correct Answers</div>
          <div className="text-gray-200">
            You answered {correct} out of {total} questions correctly. Review the questions you missed to improve your understanding.
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 mb-6">
          <button
            onClick={handleReviewMissed}
            className="flex items-center gap-2 bg-[#4db6ac] hover:bg-[#399b91] text-white font-semibold px-7 py-2 rounded-lg text-base transition-all duration-150"
            disabled={answersHistory.filter(entry => {
              const correctSet = new Set(entry.question.correct_answer.split(""));
              const chosenSet = new Set((entry.chosen || "").split(""));
              return (
                correctSet.size !== chosenSet.size ||
                ![...correctSet].every(l => chosenSet.has(l))
              );
            }).length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            Review Missed Questions
          </button>
          <button
            onClick={cancelSession}
            className="flex items-center gap-2 bg-[#374140] hover:bg-[#232726] text-white font-semibold px-7 py-2 rounded-lg text-base transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start New Exam
          </button>
        </div>
        {showReview && (
          <div className="bg-[#232726] rounded-xl px-4 md:px-8 py-4 md:py-6 mt-4 max-h-[60vh] overflow-y-auto shadow-inner">
            <h2 className="text-xl font-bold text-white mb-4">Missed Questions</h2>
            {missedQuestions.length === 0 && (
              <div className="text-gray-300">No missed questions!</div>
            )}
            <ul className="space-y-8">
              {missedQuestions.map((entry) => (
                <li key={entry.question.question_number} className="border-b border-[#374140] pb-6 last:border-b-0">
                  <div className="mb-2 text-white font-semibold">
                    Q{entry.question.question_number}: {questionFormatter(entry.question.question)}
                  </div>
                  <div className="flex flex-col gap-2">
                    {entry.question.answers.map((ans, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const correctLetters = entry.question.correct_answer.split("");
                      const chosenLetters = (entry.chosen || "").split("");
                      const isCorrect = correctLetters.includes(letter);
                      const isChosen = chosenLetters.includes(letter);
                      let bg = "bg-[#232726]";
                      let border = "border border-[#374140]";
                      let text = "text-white";
                      if (isCorrect) {
                        bg = "bg-green-100";
                        text = "text-green-800";
                        border = "border border-green-400";
                      }
                      if (isChosen && !isCorrect) {
                        bg = "bg-red-100";
                        text = "text-red-800";
                        border = "border border-red-400";
                      }
                      return (
                        <div
                          key={letter}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${bg} ${text} ${border}`}
                        >
                          <span className="font-bold">{letter}.</span>
                          <span>{answerFormatter(ans)}</span>
                          {isCorrect && (
                            <span className="ml-2 text-green-700 font-semibold text-xs bg-green-200 px-2 py-0.5 rounded">
                              Correct Answer
                            </span>
                          )}
                          {isChosen && !isCorrect && (
                            <span className="ml-2 text-red-700 font-semibold text-xs bg-red-200 px-2 py-0.5 rounded">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
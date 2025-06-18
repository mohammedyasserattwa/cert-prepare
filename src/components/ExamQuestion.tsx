import type { JSX } from 'react';
import { type ExamQuestionType } from './ExamPrep';

interface ExamQuestionProps {
  mode: 'exam' | 'practice';
  currentQuestion: ExamQuestionType;
  currentIndex: number;
  questionsLength: number;
  selectedAnswers: string[];
  handleSelectAnswer: (letter: string) => void;
  handleAnswerPractice: (letter: string) => void;
  handleNextExam: () => void;
  goNext: () => void;
  goPrev: () => void;
  isLocked: boolean;
  questionFormatter: (q: string) => (JSX.Element | null)[];
  answerFormatter: (a: string) => JSX.Element;
}

const isMultiAnswer = (correct: string) => correct.length > 1;

export function ExamQuestion({
  mode,
  currentQuestion,
  currentIndex,
  questionsLength,
  selectedAnswers,
  handleSelectAnswer,
  handleAnswerPractice,
  handleNextExam,
  goNext,
  goPrev,
  isLocked,
  questionFormatter,
  answerFormatter,
}: ExamQuestionProps) {
  const multiAnswerHint = isMultiAnswer(currentQuestion.correct_answer)
    ? <div className="text-yellow-400 text-sm mb-2">Select all that apply</div>
    : null;

  const canProceedExam = isMultiAnswer(currentQuestion.correct_answer)
    ? selectedAnswers.length > 0
    : isLocked;

  return (
    <>
      <div className="w-full max-w-3xl text-left mx-auto mb-8">
        <h3 className="text-white text-base font-medium mb-2">Progress</h3>
        <div className="w-full h-2 rounded bg-[#374140] mb-2">
          <div
            className="h-2 rounded bg-[#4db6ac] transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / questionsLength) * 100}%`,
            }}
          />
        </div>
        <span className="text-gray-400 text-sm">
          Question {currentIndex + 1} of {questionsLength}
        </span>
      </div>
      <div className="mb-4 text-left w-full max-w-3xl text-lg md:text-xl font-semibold">{questionFormatter(currentQuestion.question)}</div>
      {multiAnswerHint}
      <ul className="space-y-3 w-full max-w-3xl">
        {currentQuestion.answers.map((answer, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const correctLetters = currentQuestion.correct_answer.split("");
          const isCorrect = correctLetters.includes(letter);
          const isSelected = selectedAnswers.includes(letter);
          let border = "border border-[#374140]";
          let bg = "bg-[#232726]";
          let text = "text-white";
          let ring = "";

          if (mode === "practice" && selectedAnswers.length > 0) {
            if (isCorrect) {
              bg = "bg-green-100";
              text = "text-green-800";
              border = "border border-green-400";
            } else if (isSelected) {
              bg = "bg-red-100";
              text = "text-red-800";
              border = "border border-red-400";
            }
          }

          if (isSelected && !(mode === "practice" && selectedAnswers.length > 0)) {
            ring = "ring-2 ring-[#4db6ac] ";
            bg = "bg-[#374140]";
          }

          return (
            <li key={letter} className='min-w-full'>
              <button
                disabled={
                  mode === "practice" &&
                  (
                    (isMultiAnswer(currentQuestion.correct_answer) && selectedAnswers.length === currentQuestion.correct_answer.length) ||
                    (!isMultiAnswer(currentQuestion.correct_answer) && selectedAnswers.length > 0)
                  )
                }
                onClick={() =>
                  mode === "exam"
                    ? handleSelectAnswer(letter)
                    : handleAnswerPractice(letter)
                }
                className={`cursor-pointer w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-150 ${bg} ${text} ${border} ${ring} hover:border-[#4db6ac] focus:outline-none`}
              >
                <span className="text-left">{answerFormatter(answer)}</span>
                {isSelected && mode === "exam" && (
                  <span className="ml-2 text-[#4db6ac] font-semibold text-xs bg-[#232726] px-2 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end items-center w-full max-w-3xl mt-6">
        {mode === 'exam' && (
          <button
            onClick={handleNextExam}
            disabled={!canProceedExam}
            className={`ml-auto px-6 py-2 rounded bg-green-600 text-white font-semibold transition-all duration-150 ${
              !canProceedExam ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            }`}
          >
            Next
          </button>
        )}
      </div>
      {mode === 'practice' && (
        <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-3xl mt-6 gap-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="cursor-pointer px-6 py-2 rounded bg-blue-600 text-white font-semibold transition-all duration-150 w-full sm:w-auto"
          >
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === questionsLength - 1}
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold transition-all duration-150 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
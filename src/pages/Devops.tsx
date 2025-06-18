import { useEffect, useState } from 'react'
import questionsData from '../assets/devops_questions.json';

// Define the shape of a question
type Question = {
  question_number: number;
  question: string;
  answers: string[];
  correct_answer: string;
  category: string;
};

const getRandomQuestions = (
  questions: Question[],
  count: number,
  usedQuestions: number[]
): Question[] => {
  const available = questions.filter(q => !usedQuestions.includes(q.question_number));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const formatQuestionText = (text: string) =>
  text.split(/\n|\u2022/).map((part, index) =>
    part.trim() ? (
      <p key={index} className="mb-1">
        {text.includes('•') ? '• ' : ''}
        {part.trim()}
      </p>
    ) : null
  );

  const formatAnswerText = (answer: string) => {
  // Multi-step/bullet answer
  if (/\d+\.\s/.test(answer) || answer.includes('\u05d2\u20ac\u00a2')) {
    // Extract the letter (A., B., etc.) if present
    const match = answer.match(/^([A-D]\.)\s*/);
    const letter = match ? match[1] : null;
    const rest = match ? answer.slice(match[0].length) : answer;

    // Split into steps (if any)
    const steps = rest.split(/(?=\d+\.\s)/g).filter(Boolean);

    // For each step, split on the unicode bullet
    const bullets = steps.length > 0
      ? steps.flatMap(step => step.split('\u05d2\u20ac\u00a2').map(s => s.trim()).filter(Boolean))
      : rest.split('\u05d2\u20ac\u00a2').map(s => s.trim()).filter(Boolean);

    return (
      <div className="rounded-lg px-4 py-3">
        {letter && (
          <span className="font-bold text-white mb-2 block">{letter}</span>
        )}
        <ul className="list-disc list-inside space-y-1 ml-2 pl-6">
          {bullets.map((b, i) =>
            /^\d+\.\s/.test(b) ? (
              <div key={i} className="ml-[-1.2em] font-semibold text-white">{b}</div>
            ) : (
              <li key={i} className="text-white">{b}</li>
            )
          )}
        </ul>
      </div>
    );
  }

  // Inline code formatting for special unicode
  const parts = answer.split('\u05d2\u20ac');
  return (
    <span>
      {parts.map((part, idx) =>
        idx % 2 === 1 ? (
          <span
            key={idx}
            style={{
              fontFamily: 'Consolas, monospace',
              background: '#2d3748',
              color: '#60a5fa',
              padding: '2px 6px',
              borderRadius: '4px',
              margin: '0 2px',
              fontSize: '0.98em',
            }}
          >
            {part.trim()}
          </span>
        ) : (
          <span key={idx}>{part.trim()}</span>
        )
      )}
    </span>
  );
};

// Helper to check if a question has multiple correct answers
const isMultiAnswer = (correct: string) => correct.length > 1;

export const Devops = () => {
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [mode, setMode] = useState<'exam' | 'practice' | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<number[]>(() => {
    const saved = localStorage.getItem('DevOpsUsedQuestions');
    return saved ? JSON.parse(saved) : [];
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  // For review missed questions
  const [showReview, setShowReview] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<
    { question: Question; chosen: string | null }[]
  >([]);

  // Track answers for review
  const [answersHistory, setAnswersHistory] = useState<
    { question: Question; chosen: string | null }[]
  >([]);

  useEffect(() => {
    localStorage.setItem('DevOpsUsedQuestions', JSON.stringify(usedQuestions));
  }, [usedQuestions]);

  const startExam = () => {
    const selected = getRandomQuestions(questionsData as Question[], numQuestions, usedQuestions);
    setQuestions(selected);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setMode('exam');
    setAnswersHistory([]);
    setShowReview(false);
    setSelectedAnswers([]);
    setIsLocked(false);
  };

  const startPractice = () => {
    const available = (questionsData as Question[]).filter(
      q => !usedQuestions.includes(q.question_number)
    );
    const sorted = [...available].sort((a, b) => a.question_number - b.question_number);
    setQuestions(sorted);
    setCurrentIndex(0);
    setMode('practice');
    setSelectedAnswers([]);
    setShowReview(false);
    setIsLocked(false);
  };

  const handleSelectAnswer = (letter: string) => {
    const currentQuestion = questions[currentIndex];
    if (isMultiAnswer(currentQuestion.correct_answer)) {
      setSelectedAnswers(prev =>
        prev.includes(letter)
          ? prev.filter(l => l !== letter)
          : [...prev, letter]
      );
    } else {
      setSelectedAnswers([letter]);
      if (mode === "exam") setIsLocked(true);
    }
  };

  // For exam mode, lock in answer(s) and go to next
  const handleNextExam = () => {
    if (selectedAnswers.length > 0) {
      const currentQuestion = questions[currentIndex];
      const correctSet = new Set(currentQuestion.correct_answer.split(""));
      const selectedSet = new Set(selectedAnswers);
      const isCorrect =
        correctSet.size === selectedSet.size &&
        [...correctSet].every(l => selectedSet.has(l));
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (!isCorrect ? 1 : 0),
      }));
      setUsedQuestions(prev => [...new Set([...prev, currentQuestion.question_number])]);
      setAnswersHistory(prev => [
        ...prev,
        { question: currentQuestion, chosen: selectedAnswers.sort().join("") },
      ]);
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setIsLocked(false);
    }
  };

  // For practice mode, lock in answer(s) and show feedback
const handleAnswerPractice = (letter: string) => {
  const currentQuestion = questions[currentIndex];
  if (isMultiAnswer(currentQuestion.correct_answer)) {
    setSelectedAnswers(prev => {
      const next = prev.includes(letter)
        ? prev.filter(l => l !== letter)
        : [...prev, letter];
      // Lock only if all possible answers are selected
      if (next.length === currentQuestion.correct_answer.length) {
        setUsedQuestions(prevUsed => [...new Set([...prevUsed, currentQuestion.question_number])]);
      }
      return next;
    });
  } else {
    if (selectedAnswers.length === 0) {
      setSelectedAnswers([letter]);
      setUsedQuestions(prev => [...new Set([...prev, currentQuestion.question_number])]);
    }
  }
};

  const resetUsedQuestions = () => {
    setUsedQuestions([]);
    localStorage.removeItem('DevOpsUsedQuestions');
  };

  const cancelSession = () => {
    setMode(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setSelectedAnswers([]);
    setShowReview(false);
    setAnswersHistory([]);
    setIsLocked(false);
  };

  const goNext = () => {
    setSelectedAnswers([]);
    setCurrentIndex(prev => prev + 1);
  };

  const goPrev = () => {
    setSelectedAnswers([]);
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleReviewMissed = () => {
    // Filter only missed questions
    const missed = answersHistory.filter(
      entry => {
        const correctSet = new Set(entry.question.correct_answer.split(""));
        const chosenSet = new Set((entry.chosen || "").split(""));
        return (
          correctSet.size !== chosenSet.size ||
          ![...correctSet].every(l => chosenSet.has(l))
        );
      }
    );
    setMissedQuestions(missed);
    setShowReview(true);
  };

  const currentQuestion = questions[currentIndex];

  if (!mode) {
    return (
      <div className="min-h-full md:ml-[25%] md:max-w-[70%] mt-12 md:mt-0 flex flex-col justify-stretch items-center bg-[#181d1c] px-2">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-500">
          GCP Professional DevOps Exam Prep
        </h1>
        <p className="text-sm mb-5 text-gray-300 text-center max-w-xl">
          Prepare for your exam with some previous exam questions. Choose your
          mode and start practicing!
        </p>
        <div className="flex flex-col justify-start items-start bg-[#2b3533] rounded-md shadow w-full max-w-3xl sm:max-w-3xl md:max-w-3xl lg:max-w-md h-fit py-5 mb-10 px-5">
          <h2 className="text-xl font-semibold text-white">Used Questions</h2>
          <p className="text-xs mb-3 text-gray-300">
            The number of questions you answered from our question set
          </p>
          <div className="flex items-center justify-center w-full mb-5">
            <div className="relative w-full max-w-xs">
              {/* Progress Bar */}
              <div className="w-full h-6 bg-[#181d1c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${
                      (usedQuestions.length /
                        (questionsData as Question[]).length) *
                      100
                    }%`,
                  }}
                />
              </div>
              {/* Numbers in the center of the bar */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white drop-shadow">
                  {usedQuestions.length} /{" "}
                  {(questionsData as Question[]).length}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={resetUsedQuestions}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Reset Used Questions
          </button>
        </div>
        <h2 className="w-full max-w-full text-left mb-5 text-white">Choose Your Mode: </h2>
        <div className="flex flex-col md:flex-row w-full md:max-w-[100%] min-h-[40vh] justify-stretch items-stretch gap-2 mb-5">
          <div className="w-[100%] min-h-full rounded-md p-6 md:p-8 bg-[#2b3533] flex flex-col justify-between mb-5 md:mb-0">
            <div>
              <h3 className="text-left font-semibold text-lg text-white">Exam Mode</h3>
              <p className='text-left text-sm text-gray-300'>Mimic the exam experience with the number of questions you want
                to answer.</p>
            </div>
            <div>
              <div className="mb-4 w-full">
                <label
                  htmlFor="numQuestions"
                  className="block text-sm font-medium text-left text-gray-200 mb-1"
                >
                  Number of Questions
                </label>
                <div className="relative">
                  <input
                    id="numQuestions"
                    type="number"
                    min={1}
                    max={(questionsData as Question[]).length - usedQuestions.length}
                    placeholder="Enter number..."
                    value={numQuestions === 0 ? "" : numQuestions}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNumQuestions(isNaN(val) ? 0 : val);
                    }}
                    className="border border-gray-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#181d1c] text-white placeholder-gray-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    max {(questionsData as Question[]).length - usedQuestions.length}
                  </span>
                </div>
              </div>
              <button
                onClick={startExam}
                className="bg-[#181d1c] text-white px-4 py-2 rounded w-full"
              >
                Start Exam
              </button>
            </div>
          </div>
          <div className="w-[100%] min-h-full rounded-md p-6 md:p-10 bg-[#2b3533] flex flex-col justify-between">
            <div>
              <h3 className="text-left font-semibold text-lg text-white">Practice Mode</h3>
              <p className='text-left text-sm text-gray-300'>Friendly practice with all the questions we have. Answers are shown after you try!</p>
            </div>
            <button
              onClick={startPractice}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
              Practice Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'exam' && currentIndex >= questions.length) {
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
                      Q{entry.question.question_number}: {entry.question.question}
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
                            <span>{ans}</span>
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

  if (!currentQuestion) return null;

  // For multi-answer questions, show a hint
  const multiAnswerHint = isMultiAnswer(currentQuestion.correct_answer)
    ? <div className="text-yellow-400 text-sm mb-2">Select all that apply</div>
    : null;

  // For exam mode, lock button if no answer(s) selected
  const canProceedExam = isMultiAnswer(currentQuestion.correct_answer)
    ? selectedAnswers.length > 0
    : isLocked;

  return (
    <div className="min-h-full mt-12 md:mt-0 flex flex-col items-center justify-center bg-[#181d1c] px-2">
      <div className='flex flex-col sm:flex-row justify-between w-full max-w-3xl items-center bg-red-500 rounded-md p-2 mb-3 gap-2'>
        <p className="text-white text-center sm:text-left">Want to return back to the main page?</p>
        <button onClick={cancelSession} className="text-red-50 bg-red-900  px-5 py-1 rounded-md ">
          Cancel
        </button>
      </div>
      <div className="w-full max-w-3xl text-left mx-auto mb-8">
        <h3 className="text-white text-base font-medium mb-2">Progress</h3>
        <div className="w-full h-2 rounded bg-[#374140] mb-2">
          <div
            className="h-2 rounded bg-[#4db6ac] transition-all duration-500"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-gray-400 text-sm">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>
      <div className="mb-4 text-left w-full max-w-3xl text-lg md:text-xl font-semibold">{formatQuestionText(currentQuestion.question)}</div>
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

          // Practice mode feedback
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

          // Selected state (multi-select effect)
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
                
                <span className="text-left">{formatAnswerText(answer)}</span>
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
            disabled={currentIndex === questions.length - 1}
            className="px-6 py-2 rounded bg-blue-600 text-white font-semibold transition-all duration-150 w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
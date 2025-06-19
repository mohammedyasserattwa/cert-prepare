import { useEffect, useState, type JSX } from 'react';
import { ExamLanding } from './ExamLanding';
import { ExamResults } from './ExamResults';
import { ExamQuestion } from './ExamQuestion';
import { getRandomQuestions } from '../helpers/Formatting';

export interface ExamQuestionType {
  question_number: number;
  question: string;
  answers: string[];
  correct_answer: string;
}

interface ExamPrepProps {
  questionsData: ExamQuestionType[];
  examTitle: string;
  examDescription: string;
  landingDescription?: string;
  storageKey: string;
  questionFormatter: (q: string) => (JSX.Element | null)[];
  answerFormatter: (a: string) => JSX.Element;
}

export function ExamPrep({
  questionsData,
  examTitle,
  examDescription,
  landingDescription,
  storageKey,
  questionFormatter,
  answerFormatter,
}: ExamPrepProps) {
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [mode, setMode] = useState<'exam' | 'practice' | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [questions, setQuestions] = useState<ExamQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const [showReview, setShowReview] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<
    { question: ExamQuestionType; chosen: string | null }[]
  >([]);

  const [answersHistory, setAnswersHistory] = useState<
    { question: ExamQuestionType; chosen: string | null }[]
  >([]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(usedQuestions));
  }, [usedQuestions, storageKey]);

  const isMultiAnswer = (correct: string) => correct.length > 1;

  const startExam = () => {
    const selected = getRandomQuestions(questionsData, numQuestions, usedQuestions);
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
    const available = questionsData.filter(
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

  const handleAnswerPractice = (letter: string) => {
    const currentQuestion = questions[currentIndex];
    if (isMultiAnswer(currentQuestion.correct_answer)) {
      setSelectedAnswers(prev => {
        const next = prev.includes(letter)
          ? prev.filter(l => l !== letter)
          : [...prev, letter];
          setUsedQuestions(prevUsed => [...new Set([...prevUsed, currentQuestion.question_number])]);
          
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
    localStorage.removeItem(storageKey);
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
      <ExamLanding
        usedQuestions={usedQuestions}
        questionsData={questionsData}
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        startExam={startExam}
        startPractice={startPractice}
        resetUsedQuestions={resetUsedQuestions}
        examTitle={examTitle}
        examDescription={examDescription}
        landingDescription={landingDescription}
      />
    );
  }

  if (mode === 'exam' && currentIndex >= questions.length) {
    return (
      <ExamResults
        questions={questions}
        score={score}
        answersHistory={answersHistory}
        showReview={showReview}
        missedQuestions={missedQuestions}
        handleReviewMissed={handleReviewMissed}
        cancelSession={cancelSession}
        questionFormatter={questionFormatter}
        answerFormatter={answerFormatter}
      />
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-full mt-12 md:mt-0 flex flex-col items-center justify-center bg-[#181d1c] px-2">
      <div className='flex flex-col sm:flex-row justify-between w-full max-w-3xl items-center bg-red-500 rounded-md p-2 mb-3 gap-2'>
        <p className="text-white text-center sm:text-left">Want to return back to the main page?</p>
        <button onClick={cancelSession} className="text-red-50 bg-red-900  px-5 py-1 rounded-md ">
          Cancel
        </button>
      </div>
      <ExamQuestion
        mode={mode}
        currentQuestion={currentQuestion}
        currentIndex={currentIndex}
        questionsLength={questions.length}
        selectedAnswers={selectedAnswers}
        handleSelectAnswer={handleSelectAnswer}
        handleAnswerPractice={handleAnswerPractice}
        handleNextExam={handleNextExam}
        goNext={goNext}
        goPrev={goPrev}
        isLocked={isLocked}
        questionFormatter={questionFormatter}
        answerFormatter={answerFormatter}
      />
    </div>
  );
}
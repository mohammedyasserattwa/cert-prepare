import { ExamPrep } from '../components/ExamPrep';
import aceQuestions from '../assets/all_questions.json';
import { formatAnswerText, formatQuestionText } from '../helpers/Formatting';

export default function AcePrep() {
  return (
    <ExamPrep
      questionsData={aceQuestions}
      examTitle="GCP Associate Cloud Engineer Exam Prep"
      examDescription="Prepare for your exam with previous exam questions."
      landingDescription="Choose your mode and start practicing!"
      storageKey="usedQuestions"
      // Optionally pass formatters for question/answer text
      questionFormatter={formatQuestionText}
      answerFormatter={formatAnswerText}
    />
  );
}
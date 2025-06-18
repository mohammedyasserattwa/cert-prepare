import { ExamPrep } from '../components/ExamPrep';
import DevOpsQuestions from '../assets/devops_questions.json';
import { formatAnswerText, formatQuestionText } from '../helpers/Formatting';


export default function Devops() {
  return (
    <ExamPrep
      questionsData={DevOpsQuestions}
      examTitle="GCP Professional DevOps Engineer Exam Prep"
      examDescription="Prepare for your exam with previous exam questions."
      landingDescription="Choose your mode and start practicing!"
      storageKey="DevOpsUsedQuestions"
      // Optionally pass formatters for question/answer text
      questionFormatter={formatQuestionText}
      answerFormatter={formatAnswerText}
    />
  );
}
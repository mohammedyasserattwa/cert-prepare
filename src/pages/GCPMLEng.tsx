import { ExamPrep } from '../components/ExamPrep';
import GCPMLQuestions from '../assets/gcp_ml_engineer_questions.json';
import { formatAnswerText, formatQuestionText } from '../helpers/Formatting';


export const GCPMLEng = () => {
  return (
    <ExamPrep
      questionsData={GCPMLQuestions}
      examTitle="GCP Professional Machine Learning Engineer Exam Prep"
      examDescription="Prepare for your exam with previous exam questions."
      landingDescription="Choose your mode and start practicing!"
      storageKey="GCPMLEngUsedQuestions"
      // Optionally pass formatters for question/answer text
      questionFormatter={formatQuestionText}
      answerFormatter={formatAnswerText}
    />
  )
}

import { ExamPrep } from '../components/ExamPrep';
import GCPDataEngQestions from '../assets/gcp_data_eng_questions.json';
import { formatAnswerText, formatQuestionText } from '../helpers/Formatting';


export default function GCPDataEng() {
  return (
    <ExamPrep
      questionsData={GCPDataEngQestions}
      examTitle="GCP Professional Data Engineer Exam Prep"
      examDescription="Prepare for your exam with previous exam questions."
      landingDescription="Choose your mode and start practicing!"
      storageKey="GCPDataEngUsedQuestions"
      // Optionally pass formatters for question/answer text
      questionFormatter={formatQuestionText}
      answerFormatter={formatAnswerText}
    />
  );
}
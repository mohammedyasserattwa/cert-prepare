import { ExamPrep } from '../components/ExamPrep';
import deQuestions from '../assets/data_eng_questions.json';
import { formatAnswerText, formatQuestionText } from '../helpers/Formatting';


export default function DataBricksDataEngineer() {
  return (
    <ExamPrep
      questionsData={deQuestions}
      examTitle="DataBricks Data Engineer Exam Prep"
      examDescription="Prepare for your exam with previous exam questions."
      landingDescription="Choose your mode and start practicing!"
      storageKey="dataEngUsedQuestions"
      // Optionally pass formatters for question/answer text
      questionFormatter={formatQuestionText}
      answerFormatter={formatAnswerText}
    />
  );
}
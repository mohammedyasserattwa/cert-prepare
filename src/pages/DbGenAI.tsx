import { ExamPrep } from '../components/ExamPrep';
import deQuestions from '../assets/db_gen_ai.json';
import { formatAnswerText, formatQuestionText } from '../helpers/Formatting';


export default function DBGenAI() {
  return (
    <ExamPrep
      questionsData={deQuestions}
      examTitle="DataBricks Generative AI Engineer Exam Prep"
      examDescription="Prepare for your exam with previous exam questions."
      landingDescription="Choose your mode and start practicing!"
      storageKey="GenAIUsedQuestions"
      // Optionally pass formatters for question/answer text
      questionFormatter={formatQuestionText}
      answerFormatter={formatAnswerText}
    />
  );
}
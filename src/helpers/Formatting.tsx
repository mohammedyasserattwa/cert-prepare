import { type ExamQuestionType } from '../components/ExamPrep';

export const getRandomQuestions = (
  questions: ExamQuestionType[],
  count: number,
  usedQuestions: number[]
): ExamQuestionType[] => {
  const available = questions.filter(q => !usedQuestions.includes(q.question_number));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const formatQuestionText = (text: string) =>
  text.split(/\n|\u2022/).map((part, index) =>
    part.trim() ? (
      <p key={index} className="mb-1">
        {text.includes('•') ? '• ' : ''}
        {part.trim()}
      </p>
    ) : null
  );

  export const formatAnswerText = (answer: string) => {
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
          <span className="font-bold mb-2 block">{letter}</span>
        )}
        <ul className="list-disc list-inside space-y-1 ml-2 pl-6">
          {bullets.map((b, i) =>
            /^\d+\.\s/.test(b) ? (
              <div key={i} className="ml-[-1.2em] font-semibold">{b}</div>
            ) : (
              <li key={i}>{b}</li>
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
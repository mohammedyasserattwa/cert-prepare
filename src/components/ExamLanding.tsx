import { type ExamQuestionType } from './ExamPrep';

interface ExamLandingProps {
  usedQuestions: number[];
  questionsData: ExamQuestionType[];
  numQuestions: number;
  setNumQuestions: (n: number) => void;
  startExam: () => void;
  startPractice: () => void;
  resetUsedQuestions: () => void;
  examTitle: string;
  examDescription: string;
  landingDescription?: string;
}

export function ExamLanding({
  usedQuestions,
  questionsData,
  numQuestions,
  setNumQuestions,
  startExam,
  startPractice,
  resetUsedQuestions,
  examTitle,
  examDescription,
  landingDescription,
}: ExamLandingProps) {
  return (
    <div className="min-h-full md:ml-[25%] md:max-w-[70%] mt-12 md:mt-0 flex flex-col justify-stretch items-center bg-[#181d1c] px-2">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-white">
        {examTitle}
      </h1>
      <p className="text-sm mb-5 text-gray-300 text-center max-w-xl">
        {examDescription}
      </p>
      {landingDescription && (
        <p className="text-xs mb-5 text-gray-400 text-center max-w-xl">
          {landingDescription}
        </p>
      )}
      <div className="flex flex-col justify-start items-start bg-[#2b3533] rounded-md shadow w-full max-w-3xl sm:max-w-3xl md:max-w-3xl lg:max-w-md h-fit py-5 mb-10 px-5">
        <h2 className="text-xl font-semibold text-white">Used Questions</h2>
        <p className="text-xs mb-3 text-gray-300">
          The number of questions you answered from our question set
        </p>
        <div className="flex items-center justify-center w-full mb-5">
          <div className="relative w-full max-w-xs">
            <div className="w-full h-6 bg-[#181d1c] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    (usedQuestions.length / questionsData.length) * 100
                  }%`,
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white drop-shadow">
                {usedQuestions.length} / {questionsData.length}
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
                  max={questionsData.length - usedQuestions.length}
                  placeholder="Enter number..."
                  value={numQuestions === 0 ? "" : numQuestions}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setNumQuestions(isNaN(val) ? 0 : val);
                  }}
                  className="border border-gray-400 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#181d1c] text-white placeholder-gray-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  max {questionsData.length - usedQuestions.length}
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
import { useState } from 'react'
import { computeScore, type TestResult } from '../lib/test'

interface Props {
  result: TestResult
  onHome: () => void
  onRetake: () => void
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

type Filter = 'all' | 'correct' | 'wrong' | 'skipped'

export default function Results({ result, onHome, onRetake }: Props) {
  const score = computeScore(result)
  const [filter, setFilter] = useState<Filter>('all')

  const rows = result.questions
    .map((tq, i) => ({ tq, answer: result.answers[i], index: i }))
    .filter(({ tq, answer }) => {
      if (filter === 'all') return true
      if (filter === 'skipped') return answer.selected === null
      if (filter === 'correct') return answer.selected === tq.correctIndex
      return answer.selected !== null && answer.selected !== tq.correctIndex
    })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Test Result</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-indigo-700">
              {score.marksObtained} / {score.totalMarks}
            </p>
            <p className="text-sm text-slate-500">Score ({score.percentage.toFixed(1)}%)</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{score.correct}</p>
            <p className="text-sm text-slate-500">Correct</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{score.wrong}</p>
            <p className="text-sm text-slate-500">Wrong</p>
          </div>
          <div className="bg-slate-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-700">{score.unattempted}</p>
            <p className="text-sm text-slate-500">Skipped</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
          <span>
            Accuracy: <b>{score.accuracy.toFixed(1)}%</b>
          </span>
          <span>
            Time taken: <b>{formatTime(result.totalTimeSec)}</b>
          </span>
          <span>
            Avg time/question:{' '}
            <b>{formatTime(Math.round(result.totalTimeSec / result.questions.length))}</b>
          </span>
          <span>
            Marking: <b>+{result.config.marksPerQuestion} / -{result.config.negativeMarking}</b>
          </span>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onRetake} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium">
            Retake Similar Test
          </button>
          <button onClick={onHome} className="px-5 py-2 rounded-lg border border-slate-300">
            Back to Home
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'correct', 'wrong', 'skipped'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize border ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-300 text-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {rows.map(({ tq, answer, index }) => {
          const isCorrect = answer.selected === tq.correctIndex
          const isSkipped = answer.selected === null
          return (
            <div key={index} className="bg-white rounded-2xl shadow p-5">
              <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
                <span className="font-semibold text-slate-500">Q{index + 1}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    isSkipped
                      ? 'bg-slate-100 text-slate-600'
                      : isCorrect
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {tq.chapterName} · {tq.sheetName}
                </span>
                {tq.question.exam && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    {tq.question.exam}
                  </span>
                )}
                <span className="ml-auto text-slate-400">
                  Time: {formatTime(answer.timeSpentSec)}
                </span>
              </div>
              <p className="text-slate-800 mb-3 whitespace-pre-wrap">{tq.question.text}</p>
              <div className="space-y-2">
                {tq.shuffledOptions.map((opt, i) => {
                  let cls = 'border-slate-200'
                  if (i === tq.correctIndex) cls = 'border-green-500 bg-green-50'
                  else if (i === answer.selected) cls = 'border-red-500 bg-red-50'
                  return (
                    <div key={i} className={`px-3 py-2 rounded-lg border text-sm ${cls}`}>
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                      {i === tq.correctIndex && (
                        <span className="ml-2 text-green-700 font-medium">✓ Correct answer</span>
                      )}
                      {i === answer.selected && i !== tq.correctIndex && (
                        <span className="ml-2 text-red-700 font-medium">✗ Your answer</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {rows.length === 0 && (
          <p className="text-center text-slate-400 py-8">No questions in this category.</p>
        )}
      </div>
    </div>
  )
}

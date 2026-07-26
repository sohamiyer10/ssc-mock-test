import { useEffect, useRef, useState } from 'react'
import type { AnswerState, TestConfig, TestQuestion } from '../lib/test'

interface Props {
  config: TestConfig
  questions: TestQuestion[]
  onSubmit: (answers: AnswerState[], totalTimeSec: number) => void
}

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export default function Test({ config, questions, onSubmit }: Props) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<AnswerState[]>(
    questions.map(() => ({ selected: null, markedForReview: false, timeSpentSec: 0 })),
  )
  const [elapsed, setElapsed] = useState(0)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const submittedRef = useRef(false)
  const timeLimit = config.timerMinutes * 60

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1)
      setAnswers((prev) => {
        const next = [...prev]
        next[current] = { ...next[current], timeSpentSec: next[current].timeSpentSec + 1 }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [current])

  useEffect(() => {
    if (timeLimit > 0 && elapsed >= timeLimit && !submittedRef.current) {
      submittedRef.current = true
      onSubmit(answers, elapsed)
    }
  }, [elapsed, timeLimit, answers, onSubmit])

  const tq = questions[current]
  const answered = answers.filter((a) => a.selected !== null).length
  const marked = answers.filter((a) => a.markedForReview).length

  const select = (idx: number) =>
    setAnswers((prev) => {
      const next = [...prev]
      next[current] = { ...next[current], selected: next[current].selected === idx ? null : idx }
      return next
    })

  const toggleMark = () =>
    setAnswers((prev) => {
      const next = [...prev]
      next[current] = { ...next[current], markedForReview: !next[current].markedForReview }
      return next
    })

  const submit = () => {
    if (!submittedRef.current) {
      submittedRef.current = true
      onSubmit(answers, elapsed)
    }
  }

  const remaining = timeLimit > 0 ? Math.max(0, timeLimit - elapsed) : null

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <div>
        <div className="flex items-center justify-between bg-white rounded-xl shadow px-4 py-3 mb-4">
          <span className="font-semibold text-slate-700">
            Question {current + 1} / {questions.length}
          </span>
          <span
            className={`font-mono text-lg font-bold ${
              remaining !== null && remaining < 60 ? 'text-red-600' : 'text-slate-700'
            }`}
          >
            {remaining !== null ? formatTime(remaining) : formatTime(elapsed)}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {tq.chapterName} · {tq.sheetName}
            </span>
            {tq.question.exam && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {tq.question.exam}
              </span>
            )}
          </div>
          <p className="text-lg text-slate-800 mb-5 whitespace-pre-wrap">{tq.question.text}</p>
          <div className="space-y-3">
            {tq.shuffledOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => select(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                  answers[current].selected === i
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={toggleMark}
              className={`px-4 py-2 rounded-lg border ${
                answers[current].markedForReview
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-slate-300'
              }`}
            >
              {answers[current].markedForReview ? 'Unmark Review' : 'Mark for Review'}
            </button>
            <button
              onClick={() => select(answers[current].selected ?? -1)}
              disabled={answers[current].selected === null}
              className="px-4 py-2 rounded-lg border border-slate-300 disabled:opacity-40"
            >
              Clear Response
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className="ml-auto px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-40"
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 h-fit lg:sticky lg:top-4">
        <h3 className="font-semibold text-slate-700 mb-3">Question Palette</h3>
        <div className="grid grid-cols-6 lg:grid-cols-5 gap-2 mb-4">
          {questions.map((_, i) => {
            const a = answers[i]
            let cls = 'bg-slate-100 text-slate-600'
            if (a.markedForReview) cls = 'bg-purple-500 text-white'
            else if (a.selected !== null) cls = 'bg-green-500 text-white'
            if (i === current) cls += ' ring-2 ring-indigo-600'
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-9 rounded-lg text-sm font-medium ${cls}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <div className="text-xs text-slate-500 space-y-1 mb-4">
          <p>
            <span className="inline-block w-3 h-3 rounded bg-green-500 mr-2" />
            Answered: {answered}
          </p>
          <p>
            <span className="inline-block w-3 h-3 rounded bg-purple-500 mr-2" />
            Marked for review: {marked}
          </p>
          <p>
            <span className="inline-block w-3 h-3 rounded bg-slate-200 mr-2" />
            Not answered: {questions.length - answered}
          </p>
        </div>
        {confirmSubmit ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Submit test? {questions.length - answered} unanswered.
            </p>
            <div className="flex gap-2">
              <button
                onClick={submit}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium"
              >
                Yes, Submit
              </button>
              <button
                onClick={() => setConfirmSubmit(false)}
                className="flex-1 py-2 rounded-lg border border-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmSubmit(true)}
            className="w-full py-2 rounded-lg bg-red-600 text-white font-medium"
          >
            Submit Test
          </button>
        )}
      </div>
    </div>
  )
}

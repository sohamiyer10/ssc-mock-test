import { useMemo, useState } from 'react'
import { chapters } from '../data'
import type { TestConfig } from '../lib/test'

interface Props {
  onStart: (config: TestConfig) => void
  onShowHistory: () => void
}

export default function Setup({ onStart, onShowHistory }: Props) {
  const [selectedSheets, setSelectedSheets] = useState<string[]>(
    chapters.flatMap((c) => c.sheets.map((s) => s.id)),
  )
  const [numQuestions, setNumQuestions] = useState(25)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [negativeMarking, setNegativeMarking] = useState(0.5)
  const [marksPerQuestion, setMarksPerQuestion] = useState(2)

  const available = useMemo(
    () =>
      chapters
        .flatMap((c) => c.sheets)
        .filter((s) => selectedSheets.includes(s.id))
        .reduce((sum, s) => sum + s.questions.length, 0),
    [selectedSheets],
  )

  const toggleSheet = (id: string) =>
    setSelectedSheets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const toggleChapter = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId)!
    const ids = ch.sheets.map((s) => s.id)
    const allSelected = ids.every((id) => selectedSheets.includes(id))
    setSelectedSheets((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])],
    )
  }

  const canStart = available > 0 && numQuestions > 0

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">SSC Mock Test</h1>
          <p className="text-slate-500 mt-1">Configure your test and start practising</p>
        </div>
        <button
          onClick={onShowHistory}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Test History
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Select Chapters & Sheets</h2>
        {chapters.map((ch) => {
          const allSelected = ch.sheets.every((s) => selectedSheets.includes(s.id))
          return (
            <div key={ch.id} className="mb-4">
              <label className="flex items-center gap-3 font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleChapter(ch.id)}
                  className="w-4 h-4 accent-indigo-600"
                />
                {ch.name}
              </label>
              <div className="ml-7 mt-2 space-y-2">
                {ch.sheets.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSheets.includes(s.id)}
                      onChange={() => toggleSheet(s.id)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    {s.name}
                    <span className="text-xs text-slate-400">({s.questions.length} questions)</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
        <p className="text-sm text-slate-500">Available questions in selection: {available}</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Number of questions
          </label>
          <input
            type="number"
            min={1}
            max={available}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
          <div className="flex gap-2 mt-2">
            {[10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(Math.min(n, available))}
                className="px-3 py-1 text-sm rounded-full border border-slate-300 hover:bg-indigo-50"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Timer (minutes, 0 = no timer)
          </label>
          <input
            type="number"
            min={0}
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Marks per question</label>
          <select
            value={marksPerQuestion}
            onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value={1}>+1</option>
            <option value={2}>+2 (SSC CGL/CHSL style)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Negative marking</label>
          <select
            value={negativeMarking}
            onChange={(e) => setNegativeMarking(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value={0}>None</option>
            <option value={0.25}>-0.25</option>
            <option value={0.5}>-0.50 (SSC style)</option>
            <option value={1}>-1.00</option>
          </select>
        </div>
      </div>

      <button
        disabled={!canStart}
        onClick={() =>
          onStart({
            sheetIds: selectedSheets,
            numQuestions: Math.min(numQuestions, available),
            timerMinutes,
            negativeMarking,
            marksPerQuestion,
          })
        }
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start Test
      </button>
      <p className="text-center text-xs text-slate-400 mt-3">
        Questions and options are randomized on every attempt.
      </p>
    </div>
  )
}

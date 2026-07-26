import { computeScore, loadHistory, type TestResult } from '../lib/test'

interface Props {
  onBack: () => void
  onView: (result: TestResult) => void
}

export default function History({ onBack, onView }: Props) {
  const history = loadHistory()
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Test History</h1>
        <button onClick={onBack} className="px-4 py-2 rounded-lg border border-slate-300">
          Back
        </button>
      </div>
      {history.length === 0 && (
        <p className="text-center text-slate-400 py-12">No tests taken yet.</p>
      )}
      <div className="space-y-3">
        {history.map((r) => {
          const s = computeScore(r)
          return (
            <button
              key={r.id}
              onClick={() => onView(r)}
              className="w-full text-left bg-white rounded-xl shadow p-4 hover:ring-2 hover:ring-indigo-300"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-slate-800">
                    {new Date(r.date).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {r.questions.length} questions · {s.correct} correct · {s.wrong} wrong ·{' '}
                    {s.unattempted} skipped
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-700">
                    {s.marksObtained}/{s.totalMarks}
                  </p>
                  <p className="text-xs text-slate-400">Accuracy {s.accuracy.toFixed(1)}%</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

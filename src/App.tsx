import { useState } from 'react'
import Setup from './components/Setup'
import Test from './components/Test'
import Results from './components/Results'
import History from './components/History'
import {
  buildTest,
  saveResult,
  type AnswerState,
  type TestConfig,
  type TestQuestion,
  type TestResult,
} from './lib/test'

type Screen = 'setup' | 'test' | 'results' | 'history'

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [config, setConfig] = useState<TestConfig | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [result, setResult] = useState<TestResult | null>(null)

  const startTest = (cfg: TestConfig) => {
    setConfig(cfg)
    setQuestions(buildTest(cfg))
    setScreen('test')
  }

  const submitTest = (answers: AnswerState[], totalTimeSec: number) => {
    if (!config) return
    const r: TestResult = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      config,
      questions,
      answers,
      totalTimeSec,
    }
    saveResult(r)
    setResult(r)
    setScreen('results')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {screen === 'setup' && (
        <Setup onStart={startTest} onShowHistory={() => setScreen('history')} />
      )}
      {screen === 'test' && config && (
        <Test config={config} questions={questions} onSubmit={submitTest} />
      )}
      {screen === 'results' && result && (
        <Results
          result={result}
          onHome={() => setScreen('setup')}
          onRetake={() => startTest(result.config)}
        />
      )}
      {screen === 'history' && (
        <History
          onBack={() => setScreen('setup')}
          onView={(r) => {
            setResult(r)
            setScreen('results')
          }}
        />
      )}
    </div>
  )
}

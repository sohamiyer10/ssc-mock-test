import type { Question } from '../data/types'
import { chapters } from '../data'

export interface TestQuestion {
  question: Question
  chapterName: string
  sheetName: string
  shuffledOptions: string[]
  correctIndex: number
}

export interface TestConfig {
  sheetIds: string[]
  numQuestions: number
  timerMinutes: number
  negativeMarking: number
  marksPerQuestion: number
}

export interface AnswerState {
  selected: number | null
  markedForReview: boolean
  timeSpentSec: number
}

export interface TestResult {
  id: string
  date: string
  config: TestConfig
  questions: TestQuestion[]
  answers: AnswerState[]
  totalTimeSec: number
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildTest(config: TestConfig): TestQuestion[] {
  const pool: TestQuestion[] = []
  for (const ch of chapters) {
    for (const sheet of ch.sheets) {
      if (!config.sheetIds.includes(sheet.id)) continue
      for (const q of sheet.questions) {
        const order = shuffle(q.options.map((_, i) => i))
        pool.push({
          question: q,
          chapterName: ch.name,
          sheetName: sheet.name,
          shuffledOptions: order.map((i) => q.options[i]),
          correctIndex: order.indexOf(q.correct),
        })
      }
    }
  }
  return shuffle(pool).slice(0, config.numQuestions)
}

export interface Score {
  correct: number
  wrong: number
  unattempted: number
  marksObtained: number
  totalMarks: number
  accuracy: number
  percentage: number
}

export function computeScore(result: Pick<TestResult, 'questions' | 'answers' | 'config'>): Score {
  let correct = 0
  let wrong = 0
  let unattempted = 0
  result.questions.forEach((tq, i) => {
    const sel = result.answers[i]?.selected
    if (sel === null || sel === undefined) unattempted++
    else if (sel === tq.correctIndex) correct++
    else wrong++
  })
  const { marksPerQuestion, negativeMarking } = result.config
  const marksObtained = correct * marksPerQuestion - wrong * negativeMarking
  const totalMarks = result.questions.length * marksPerQuestion
  const attempted = correct + wrong
  return {
    correct,
    wrong,
    unattempted,
    marksObtained,
    totalMarks,
    accuracy: attempted ? (correct / attempted) * 100 : 0,
    percentage: totalMarks ? (marksObtained / totalMarks) * 100 : 0,
  }
}

const HISTORY_KEY = 'ssc-mock-test-history'

export function loadHistory(): TestResult[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as TestResult[]
  } catch {
    return []
  }
}

export function saveResult(result: TestResult) {
  const history = loadHistory()
  history.unshift(result)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
}

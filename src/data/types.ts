export interface Question {
  id: string
  text: string
  options: string[]
  correct: number
  exam?: string
}

export interface Sheet {
  id: string
  name: string
  questions: Question[]
}

export interface Chapter {
  id: string
  name: string
  sheets: Sheet[]
}

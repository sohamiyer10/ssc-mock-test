import type { Chapter } from './types'
import { profitLossSheet1Questions } from './profit-loss-sheet-1'

export const chapters: Chapter[] = [
  {
    id: 'profit-loss',
    name: 'Profit & Loss',
    sheets: [
      {
        id: 'profit-loss-sheet-1',
        name: 'Sheet 1',
        questions: profitLossSheet1Questions,
      },
    ],
  },
]

import dayjs from 'dayjs'

export class RateLimitFixedTime {
  tokens: number
  maxTokens: number
  lastConsumed: string
  timeWindow: number

  constructor() {
    console.log('constructed')
    this.maxTokens = 3
    this.tokens = this.maxTokens
    this.lastConsumed = this.getTimeWithMinutes()
    this.timeWindow = 1
  }

  consume() {
    console.log('consumed Fixed Window')

    if (this.isTimeWindowOver(this.lastConsumed)) {
      this.regenerate()
    }

    if (this.tokens <= 0) {
      return -1
    }

    this.lastConsumed = this.getTimeWithMinutes()

    return --this.tokens
  }

  regenerate() {
    console.log('regenerated')
    this.tokens = this.maxTokens
  }

  getTimeWithMinutes() {
    return dayjs().format('YYYY-MM-DD HH:mm')
  }

  isTimeWindowOver(dateString: string) {
    const now = dayjs().startOf('minute')
    const dateToCompare = dayjs(dateString)

    console.log('dates', {
      now: now.format('YYYY-MM-DD HH:mm'),
      dateToCompare: dateToCompare.format('YYYY-MM-DD HH:mm'),
    })

    return now.diff(dateToCompare) >= this.timeWindow
  }
}

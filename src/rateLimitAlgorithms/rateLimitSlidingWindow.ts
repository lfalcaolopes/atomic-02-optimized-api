import dayjs from 'dayjs'

export class RateLimitSlidingWindow {
  maxTokens: number
  lastRequests: string[]
  timeWindow: number

  constructor() {
    console.log('constructed')
    this.maxTokens = 3
    this.lastRequests = []
    this.timeWindow = 1
  }

  consume() {
    console.log('consumed Sliding Window')

    this.clearPastRequests()

    if (this.lastRequests.length >= this.maxTokens) {
      return -1
    }

    this.lastRequests.push(dayjs().format())

    console.log(this.lastRequests)

    return 1
  }

  clearPastRequests() {
    const finalList = []
    const cutOffDate = dayjs().subtract(this.timeWindow, 'minute')

    for (const item of this.lastRequests) {
      if (dayjs(item).isAfter(cutOffDate)) {
        finalList.push(item)
      }
    }

    this.lastRequests = finalList
  }
}

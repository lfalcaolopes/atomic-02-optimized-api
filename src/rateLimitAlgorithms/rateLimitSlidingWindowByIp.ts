import dayjs from 'dayjs'

export class RateLimitSlidingWindowByIp {
  maxTokens: number
  lastRequests: Map<string, string[]>
  timeWindow: number

  constructor() {
    console.log('constructed')
    this.maxTokens = 3
    this.lastRequests = new Map()
    this.timeWindow = 1
  }

  consume(userIp: string | undefined) {
    console.log('consumed Sliding Window')

    if (!userIp) return -1

    const usersLastRequests = this.getOrCreateUserRequests(userIp)

    const clearedUsersLastRequests = this.clearPastRequests(usersLastRequests)

    if (clearedUsersLastRequests.length >= this.maxTokens) {
      return -1
    }

    clearedUsersLastRequests.push(dayjs().format())

    this.lastRequests.set(userIp, clearedUsersLastRequests)

    console.log(this.lastRequests)

    return 1
  }

  getOrCreateUserRequests(userIp: string) {
    const requests = this.lastRequests.get(userIp)

    if (requests) return requests

    this.lastRequests.set(userIp, [])

    return []
  }

  clearPastRequests(lastRequests: string[]) {
    const finalList = []
    const cutOffDate = dayjs().subtract(this.timeWindow, 'minute')

    for (const item of lastRequests) {
      if (dayjs(item).isAfter(cutOffDate)) {
        finalList.push(item)
      }
    }

    return finalList
  }
}

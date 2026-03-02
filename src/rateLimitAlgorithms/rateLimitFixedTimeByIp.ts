import dayjs from 'dayjs'

interface userValueType {
  lastConsumed: string
  tokens: number
}

export class RateLimitFixedTimeIp {
  tokens: number
  maxTokens: number
  lastConsumedByUserIp: Map<string, userValueType>
  timeWindow: number

  constructor() {
    console.log('constructed')
    this.maxTokens = 3
    this.tokens = this.maxTokens
    this.lastConsumedByUserIp = new Map()
    this.timeWindow = 1
  }

  consume(userIp: string | undefined) {
    console.log('consumed Fixed Window By Ip', userIp)

    if (!userIp) return -1

    const userData = this.getUserData(userIp)

    const updatedUserValue = this.consumeUserTokens({ userIp, userData })

    if (updatedUserValue.tokens < 0) {
      return -1
    }

    return updatedUserValue.tokens
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

  getUserData(userIp: string) {
    const userValue = this.lastConsumedByUserIp.get(userIp)

    if (userValue) {
      return userValue
    }

    const now = this.getTimeWithMinutes()
    const newUserValue = { lastConsumed: now, tokens: this.maxTokens }

    this.lastConsumedByUserIp.set(userIp, newUserValue)

    return newUserValue
  }

  consumeUserTokens({ userIp, userData }: { userIp: string; userData: userValueType }) {
    let userTokens = userData.tokens

    if (this.isTimeWindowOver(userData.lastConsumed)) {
      console.log('regenerated')
      userTokens = this.maxTokens
    }

    const updatedUserValue = { lastConsumed: this.getTimeWithMinutes(), tokens: --userTokens }

    this.lastConsumedByUserIp.set(userIp, updatedUserValue)

    return updatedUserValue
  }
}

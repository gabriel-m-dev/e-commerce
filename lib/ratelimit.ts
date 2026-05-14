import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRatelimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  })
}

// 5 checkout attempts per minute per IP
export const checkoutLimiter = createRatelimiter(5, '1 m')

// 30 webhook calls per minute per IP (MP sends multiple notifications)
export const webhookLimiter = createRatelimiter(30, '1 m')

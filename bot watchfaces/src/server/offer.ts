export const TARGET_AUTHOR = 'matze_styles4you'
export const TARGET_SUBREDDITS = [
  'GalaxyWatchFace',
  'wearosfaces',
  'androidwatchfaces',
  'WearOS',
  'GalaxyWatch',
] as const

const BRAND_PATTERN = /\bS4U\b|styles\s*4\s*you|styles4you/iu
const DISCOUNT_PATTERN =
  /(?<before>100|[5-9]\d)\s*%\s*(?:off|discount|sale|sconto)?|(?:off|discount|sale|sconto)\s*(?:of|del|fino\s+al|up\s+to)?\s*(?<after>100|[5-9]\d)\s*%/giu
const FREE_PATTERN =
  /(?<!feel\s)\b(?:free|gratis|gratuito|giveaway)\b|(?:€|\$|£)\s*0(?:[.,]00)?\b/iu
const URL_PATTERN = /https?:\/\/[^\s<>"]+/giu
const LABELED_CODE_PATTERN =
  /(?:promo(?:tional)?|coupon|discount|redeem|voucher|codice)(?:\s+(?:code|codice))?\s*(?:is|è|:|=|-)\s*`?([A-Z0-9][A-Z0-9-]{4,31})`?/iu
const GENERIC_CODE_PATTERN =
  /(?<![A-Za-z0-9])([A-Z0-9]{10,32})(?![A-Za-z0-9])/gu

const STORE_HOSTS = [
  'play.google.com',
  'galaxystore.samsung.com',
  'galaxy.store',
  'apps.samsung.com',
]
const COUPON_HINTS = ['coupon', 'promo', 'redeem']

export type PostSnapshot = {
  id: string
  authorName: string
  subredditName: string
  permalink: string
  title: string
  body?: string
  url: string
  createdAt: Date
}

export type Offer = {
  redditId: string
  title: string
  redditUrl: string
  subreddit: string
  discount: number
  watchfaceLinks: string[]
  couponLinks: string[]
  code?: string
  createdAt: string
}

export function isS4uCandidate(post: PostSnapshot): boolean {
  return (
    post.authorName.toLowerCase() === TARGET_AUTHOR ||
    BRAND_PATTERN.test(`${post.title}\n${post.body ?? ''}`)
  )
}

export function detectDiscount(text: string): number | undefined {
  const percentages: number[] = []
  for (const match of text.matchAll(DISCOUNT_PATTERN)) {
    const value = match.groups?.before ?? match.groups?.after
    if (value) percentages.push(Number(value))
  }
  if (FREE_PATTERN.test(text)) percentages.push(100)
  return percentages.length > 0 ? Math.max(...percentages) : undefined
}

export function extractCode(text: string): string | undefined {
  const labeled = text.match(LABELED_CODE_PATTERN)?.[1]
  if (labeled) return labeled.toUpperCase()

  for (const match of text.matchAll(GENERIC_CODE_PATTERN)) {
    const candidate = match[1]
    if (candidate && /[A-Z]/u.test(candidate) && /\d/u.test(candidate)) {
      return candidate
    }
  }
  return undefined
}

export function extractUrls(text: string): string[] {
  const urls: string[] = []
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0].replace(/[.,;:!?)\]}'"]+$/u, '')
    if (!urls.includes(url)) urls.push(url)
  }
  return urls
}

export function classifyLinks(urls: readonly string[]): {
  watchfaceLinks: string[]
  couponLinks: string[]
} {
  const watchfaceLinks: string[] = []
  const couponLinks: string[] = []
  for (const url of urls) {
    let host: string
    try {
      host = new URL(url).hostname.toLowerCase()
    } catch {
      continue
    }
    const lowered = url.toLowerCase()
    if (STORE_HOSTS.some(storeHost => host === storeHost)) {
      if (!watchfaceLinks.includes(url)) watchfaceLinks.push(url)
    } else if (COUPON_HINTS.some(hint => lowered.includes(hint))) {
      if (!couponLinks.includes(url)) couponLinks.push(url)
    }
  }
  return {watchfaceLinks, couponLinks}
}

export function buildOffer(
  post: PostSnapshot,
  commentBodies: readonly string[],
): Offer | undefined {
  const combined = [post.title, post.body ?? '', ...commentBodies].join('\n')
  if (!BRAND_PATTERN.test(combined)) return undefined

  const discount = detectDiscount(combined)
  if (discount === undefined || discount < 50 || discount > 100) {
    return undefined
  }

  const urls = extractUrls(combined)
  if (/^https?:\/\//iu.test(post.url) && !urls.includes(post.url)) {
    urls.unshift(post.url)
  }
  const {watchfaceLinks, couponLinks} = classifyLinks(urls)

  return {
    redditId: post.id,
    title: post.title || 'Offerta S4U',
    redditUrl: new URL(post.permalink, 'https://www.reddit.com').toString(),
    subreddit: post.subredditName,
    discount,
    watchfaceLinks,
    couponLinks,
    code: extractCode(combined),
    createdAt: post.createdAt.toISOString(),
  }
}

export function shouldRunScheduled(now: Date): boolean {
  const localHour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Europe/Rome',
    }).format(now),
  )
  return [8, 14, 20].includes(localHour)
}

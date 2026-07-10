import assert from 'node:assert/strict'
import {test} from 'node:test'
import {buildEmailBody} from './email.ts'
import {
  buildOffer,
  classifyLinks,
  detectDiscount,
  extractCode,
  extractUrls,
  type Offer,
  type PostSnapshot,
  shouldRunScheduled,
} from './offer.ts'

test('detects only qualifying discount language', () => {
  assert.equal(detectDiscount('S4U watch face is 50% OFF'), 50)
  assert.equal(detectDiscount('Sconto fino al 75%'), 75)
  assert.equal(detectDiscount('Free S4U watchface this weekend'), 100)
  assert.equal(detectDiscount('Feel free to ask questions'), undefined)
  assert.equal(detectDiscount('Save 49%'), undefined)
})

test('extracts labeled and Google Play style codes', () => {
  assert.equal(extractCode('Promo code: AB12-CD34-EF56'), 'AB12-CD34-EF56')
  assert.equal(extractCode('Use ABC123DEF456GHI789JK'), 'ABC123DEF456GHI789JK')
})

test('extracts and classifies direct links', () => {
  const urls = extractUrls(
    '[Get it](https://play.google.com/store/apps/details?id=s4u.test), ' +
      'then visit https://watchface-coupon.example/code.',
  )
  assert.deepEqual(classifyLinks(urls), {
    watchfaceLinks: [
      'https://play.google.com/store/apps/details?id=s4u.test',
    ],
    couponLinks: ['https://watchface-coupon.example/code'],
  })
})

test('builds an offer from a Reddit post and its comments', () => {
  const post: PostSnapshot = {
    id: 't3_abc123',
    authorName: 'matze_styles4you',
    subredditName: 'GalaxyWatchFace',
    permalink: '/r/GalaxyWatchFace/comments/abc123/s4u_assen/',
    title: 'S4U Assen — 75% OFF',
    body: 'https://play.google.com/store/apps/details?id=com.watch.s4u',
    url: 'https://www.reddit.com/r/GalaxyWatchFace/comments/abc123/',
    createdAt: new Date('2026-07-10T09:00:00Z'),
  }
  const offer = buildOffer(post, ['Coupon code: A1B2C3D4E5F6'])
  assert.ok(offer)
  assert.equal(offer.discount, 75)
  assert.equal(offer.code, 'A1B2C3D4E5F6')
  assert.deepEqual(offer.watchfaceLinks, [
    'https://play.google.com/store/apps/details?id=com.watch.s4u',
  ])
})

test('rejects posts from another brand', () => {
  const post: PostSnapshot = {
    id: 't3_abc123',
    authorName: 'someone',
    subredditName: 'GalaxyWatchFace',
    permalink: '/r/GalaxyWatchFace/comments/abc123/other/',
    title: 'Other brand — 100% OFF',
    url: 'https://www.reddit.com/r/GalaxyWatchFace/comments/abc123/',
    createdAt: new Date('2026-07-10T09:00:00Z'),
  }
  assert.equal(buildOffer(post, []), undefined)
})

test('uses Europe/Rome schedule in summer and winter', () => {
  assert.equal(shouldRunScheduled(new Date('2026-07-10T06:17:00Z')), true)
  assert.equal(shouldRunScheduled(new Date('2026-07-10T07:17:00Z')), false)
  assert.equal(shouldRunScheduled(new Date('2026-01-10T07:17:00Z')), true)
})

test('renders copyable codes and escaped links in email', () => {
  const offer: Offer = {
    redditId: 't3_abc123',
    title: 'S4U <Assen>',
    redditUrl:
      'https://www.reddit.com/r/GalaxyWatchFace/comments/abc123/example/',
    subreddit: 'GalaxyWatchFace',
    discount: 50,
    watchfaceLinks: [
      'https://play.google.com/store/apps/details?id=s4u.test&hl=it',
    ],
    couponLinks: ['https://watchface-coupon.example/code'],
    code: 'CODE123456',
    createdAt: '2026-07-10T09:00:00.000Z',
  }
  const message = buildEmailBody([offer])
  assert.match(message.text, /CODE123456/u)
  assert.match(message.html, /S4U &lt;Assen&gt;/u)
  assert.match(message.html, /play\.google\.com/u)
  assert.match(message.html, /watchface-coupon\.example/u)
  assert.match(message.html, /&amp;hl=it/u)
})

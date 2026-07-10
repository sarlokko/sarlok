import type {Post} from '@devvit/web/server'
import {reddit, redis} from '@devvit/web/server'
import {deliverOffers} from './email.ts'
import {
  buildOffer,
  isS4uCandidate,
  type Offer,
  type PostSnapshot,
  TARGET_AUTHOR,
  TARGET_SUBREDDITS,
} from './offer.ts'

const LOOKBACK_MS = 24 * 60 * 60 * 1000
const SEEN_TTL_SECONDS = 45 * 24 * 60 * 60

export type MonitorResult = {
  candidates: number
  qualifying: number
  newOffers: number
  configured: boolean
  sent: boolean
}

export async function runMonitor(now = new Date()): Promise<MonitorResult> {
  const posts = await collectCandidatePosts()
  const cutoff = new Date(now.getTime() - LOOKBACK_MS)
  const recentPosts = [...posts.values()].filter(
    post => post.createdAt >= cutoff && post.createdAt <= now,
  )

  const qualifying: Offer[] = []
  for (const post of recentPosts) {
    const snapshot = toSnapshot(post)
    if (!isS4uCandidate(snapshot)) continue
    const comments = await fetchCommentBodies(post)
    const offer = buildOffer(snapshot, comments)
    if (offer) qualifying.push(offer)
  }

  const newOffers: Offer[] = []
  for (const offer of qualifying) {
    if (!(await redis.get(seenKey(offer.redditId)))) newOffers.push(offer)
  }

  if (newOffers.length === 0) {
    return {
      candidates: recentPosts.length,
      qualifying: qualifying.length,
      newOffers: 0,
      configured: true,
      sent: false,
    }
  }

  console.log(
    `Found ${newOffers.length} new qualifying S4U offer(s): ${newOffers
      .map(offer => offer.redditUrl)
      .join(', ')}`,
  )
  const delivery = await deliverOffers(newOffers)
  if (delivery.sent) await markSeen(newOffers)

  return {
    candidates: recentPosts.length,
    qualifying: qualifying.length,
    newOffers: newOffers.length,
    configured: delivery.configured,
    sent: delivery.sent,
  }
}

async function collectCandidatePosts(): Promise<Map<string, Post>> {
  const posts = new Map<string, Post>()

  await addPosts(
    posts,
    `u/${TARGET_AUTHOR}`,
    async () =>
      await reddit
        .getPostsByUser({
          username: TARGET_AUTHOR,
          sort: 'new',
          timeframe: 'week',
          limit: 50,
          pageSize: 50,
        })
        .all(),
  )

  for (const subredditName of TARGET_SUBREDDITS) {
    await addPosts(
      posts,
      `r/${subredditName}`,
      async () =>
        await reddit
          .getNewPosts({subredditName, limit: 100, pageSize: 100})
          .all(),
    )
  }
  return posts
}

async function addPosts(
  destination: Map<string, Post>,
  source: string,
  fetchPosts: () => Promise<Post[]>,
): Promise<void> {
  try {
    for (const post of await fetchPosts()) destination.set(post.id, post)
  } catch (error) {
    console.warn(
      `Could not read ${source}: ${error instanceof Error ? error.message : error}`,
    )
  }
}

async function fetchCommentBodies(post: Post): Promise<string[]> {
  try {
    const comments = await reddit
      .getComments({postId: post.id, limit: 50, pageSize: 50})
      .all()
    return comments.map(comment => comment.body)
  } catch (error) {
    console.warn(
      `Could not read comments for ${post.id}: ${
        error instanceof Error ? error.message : error
      }`,
    )
    return []
  }
}

function toSnapshot(post: Post): PostSnapshot {
  return {
    id: post.id,
    authorName: post.authorName,
    subredditName: post.subredditName,
    permalink: post.permalink,
    title: post.title,
    body: post.body,
    url: post.url,
    createdAt: post.createdAt,
  }
}

async function markSeen(offers: readonly Offer[]): Promise<void> {
  for (const offer of offers) {
    const key = seenKey(offer.redditId)
    await redis.set(key, '1')
    await redis.expire(key, SEEN_TTL_SECONDS)
  }
}

function seenKey(redditId: string): string {
  return `seen-offer:${redditId}`
}

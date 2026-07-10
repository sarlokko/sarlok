import {reddit, settings} from '@devvit/web/server'
import type {Offer} from './offer.ts'

const SUBREDDIT_SETTING = 'notification_subreddit'

export type DeliveryResult =
  | {configured: false; sent: false}
  | {configured: true; sent: true}

export async function deliverOffers(
  offers: readonly Offer[],
  subject?: string,
): Promise<DeliveryResult> {
  const subredditName = await getNotificationSubreddit()
  if (!subredditName) return {configured: false, sent: false}

  const subreddit = await reddit.getSubredditByName(subredditName)
  await reddit.modMail.createModNotification({
    subredditId: subreddit.id,
    subject:
      subject ??
      `S4U: ${offers.length} ${
        offers.length === 1 ? 'offerta trovata' : 'offerte trovate'
      }`,
    bodyMarkdown: buildMessageBody(offers),
  })
  return {configured: true, sent: true}
}

export async function deliverTestNotification(): Promise<DeliveryResult> {
  const now = new Date()
  return await deliverOffers(
    [
      {
        redditId: `reddit-test-${now.getTime()}`,
        title: 'Notifiche S4U configurate correttamente',
        redditUrl: 'https://www.reddit.com/r/s4u_discount_aler_dev/',
        subreddit: 's4u_discount_aler_dev',
        discount: 100,
        watchfaceLinks: [],
        couponLinks: [],
        code: 'TEST-OK',
        createdAt: now.toISOString(),
      },
    ],
    'S4U Reddit Alert: messaggio di prova',
  )
}

export function buildMessageBody(offers: readonly Offer[]): string {
  const lines: string[] = [
    'Nuove offerte S4U trovate direttamente su Reddit:',
    '',
  ]

  for (const offer of offers) {
    lines.push(
      `**${offer.title} — ${offer.discount}% di sconto**`,
      '',
      `Codice: **${codeDescription(offer)}**`,
      ...offer.watchfaceLinks.map(link => `Watchface: ${link}`),
      ...offer.couponLinks.map(link => `Pagina coupon: ${link}`),
      `Post Reddit: ${offer.redditUrl}`,
      '',
    )
  }
  return lines.join('\n')
}

async function getNotificationSubreddit(): Promise<string | undefined> {
  const value = (await settings.get<string>(SUBREDDIT_SETTING))?.trim()
  if (!value) return undefined
  return value.replace(/^r\//iu, '')
}

function codeDescription(offer: Offer): string {
  if (offer.code) return offer.code
  if (offer.couponLinks.length > 0) {
    return 'Da ottenere dalla pagina coupon'
  }
  if (offer.discount === 100) {
    return 'Nessun codice rilevato (offerta gratuita)'
  }
  return 'Codice non trovato'
}

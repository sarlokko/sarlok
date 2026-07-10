import {settings} from '@devvit/web/server'
import {buildMessageBody} from './notification.ts'
import type {Offer} from './offer.ts'

type EmailConfig = {
  apiKey: string
  recipient: string
}

export type EmailDeliveryResult =
  | {configured: false; sent: false}
  | {configured: true; sent: true}

export async function deliverEmailOffers(
  offers: readonly Offer[],
  subject?: string,
): Promise<EmailDeliveryResult> {
  const config = await getEmailConfig()
  if (!config) return {configured: false, sent: false}

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'S4U Reddit Alert <onboarding@resend.dev>',
      to: [config.recipient],
      subject:
        subject ??
        `S4U: ${offers.length} ${
          offers.length === 1 ? 'offerta trovata' : 'offerte trovate'
        }`,
      text: buildMessageBody(offers),
    }),
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300)
    throw new Error(`Resend returned HTTP ${response.status}: ${detail}`)
  }
  return {configured: true, sent: true}
}

export async function deliverTestEmail(): Promise<EmailDeliveryResult> {
  const now = new Date()
  return await deliverEmailOffers(
    [
      {
        redditId: `email-test-${now.getTime()}`,
        title: 'Email S4U configurata correttamente',
        redditUrl: 'https://www.reddit.com/r/s4u_discount_aler_dev/',
        subreddit: 's4u_discount_aler_dev',
        discount: 100,
        watchfaceLinks: [],
        couponLinks: [],
        code: 'TEST-OK',
        createdAt: now.toISOString(),
      },
    ],
    'S4U Reddit Alert: email di prova',
  )
}

async function getEmailConfig(): Promise<EmailConfig | undefined> {
  const [apiKey, recipient] = await Promise.all([
    settings.get<string>('resend_api_key'),
    settings.get<string>('email_recipient'),
  ])
  if (!apiKey?.trim() || !recipient?.trim()) return undefined
  return {apiKey: apiKey.trim(), recipient: recipient.trim()}
}

import {settings} from '@devvit/web/server'
import type {Offer} from './offer.ts'

type EmailConfig = {
  webhookUrl: string
  webhookToken: string
  recipient: string
}

export type DeliveryResult =
  | {configured: false; sent: false}
  | {configured: true; sent: true}

export async function deliverOffers(
  offers: readonly Offer[],
  subject?: string,
): Promise<DeliveryResult> {
  const config = await getEmailConfig()
  if (!config) return {configured: false, sent: false}

  const notificationId = offers
    .map(offer => offer.redditId)
    .sort()
    .join('-')
  const body = buildEmailBody(offers)
  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      token: config.webhookToken,
      notificationId,
      recipient: config.recipient,
      subject:
        subject ??
        `S4U: ${offers.length} ${
          offers.length === 1 ? 'offerta trovata' : 'offerte trovate'
        }`,
      textBody: body.text,
      htmlBody: body.html,
    }),
    redirect: 'follow',
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300)
    throw new Error(`Gmail webhook returned HTTP ${response.status}: ${detail}`)
  }
  const detail = (await response.json()) as {ok?: boolean; error?: string}
  if (detail.ok !== true) {
    throw new Error(
      `Gmail webhook rejected the alert: ${detail.error ?? 'unknown error'}`,
    )
  }
  return {configured: true, sent: true}
}

export async function deliverTestEmail(): Promise<DeliveryResult> {
  const now = new Date()
  return await deliverOffers(
    [
      {
        redditId: `gmail-test-${now.getTime()}`,
        title: 'Connessione Gmail configurata correttamente',
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
  const [webhookUrl, webhookToken, recipient] = await Promise.all([
    settings.get<string>('gmail_webhook_url'),
    settings.get<string>('gmail_webhook_token'),
    settings.get<string>('alert_recipient'),
  ])
  if (!webhookUrl || !webhookToken || !recipient) return undefined

  const parsed = new URL(webhookUrl)
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'script.google.com' ||
    !/^\/macros\/s\/[^/]+\/exec$/u.test(parsed.pathname)
  ) {
    throw new Error('Invalid Gmail Apps Script webhook URL')
  }
  return {webhookUrl, webhookToken, recipient}
}

export function buildEmailBody(offers: readonly Offer[]): {
  text: string
  html: string
} {
  const text: string[] = [
    'Nuove offerte S4U trovate direttamente su Reddit:',
    '',
  ]
  const html: string[] = [
    '<h2>Nuove offerte S4U trovate direttamente su Reddit</h2>',
    '<p>Codici e link sono riportati qui sotto.</p>',
  ]

  for (const offer of offers) {
    const code = codeDescription(offer)
    text.push(
      `${offer.title} — ${offer.discount}% di sconto`,
      `Codice: ${code}`,
      ...offer.watchfaceLinks.map(link => `Watchface: ${link}`),
      ...offer.couponLinks.map(link => `Pagina coupon: ${link}`),
      `Post Reddit: ${offer.redditUrl}`,
      '',
    )

    const links = [
      ...offer.watchfaceLinks.map(link => ({
        label: 'Apri la watchface',
        url: link,
      })),
      ...offer.couponLinks.map(link => ({
        label: 'Apri la pagina coupon',
        url: link,
      })),
    ]
    html.push(
      '<hr>',
      `<h3>${escapeHtml(offer.title)}</h3>`,
      `<p><strong>Sconto: ${offer.discount}%</strong></p>`,
      '<p>Codice:</p>',
      '<p style="font: bold 22px monospace; padding: 12px; background: #f2f2f2; display: inline-block;">',
      `${escapeHtml(code)}</p>`,
      '<ul>',
      ...(links.length > 0
        ? links.map(
            link =>
              `<li><a href="${escapeHtml(link.url)}">${link.label}</a></li>`,
          )
        : ['<li>Link diretto non trovato: apri il post Reddit.</li>']),
      '</ul>',
      `<p><a href="${escapeHtml(offer.redditUrl)}">Apri il post Reddit</a> · r/${escapeHtml(offer.subreddit)}</p>`,
    )
  }
  return {text: text.join('\n'), html: html.join('\n')}
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

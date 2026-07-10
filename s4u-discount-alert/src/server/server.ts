import type {IncomingMessage, ServerResponse} from 'node:http'
import type {TaskResponse} from '@devvit/web/server'
import type {PartialJsonValue, UiResponse} from '@devvit/web/shared'
import {Endpoint, EndpointMethod, type ErrorRsp} from '../shared/api.ts'
import {deliverTestEmail} from './email.ts'
import {runMonitor} from './monitor.ts'
import {deliverTestNotification} from './notification.ts'
import {shouldRunScheduled} from './offer.ts'

type AnyRsp = UiResponse | TaskResponse | ErrorRsp

export async function onReq(
  reqMsg: IncomingMessage,
  rspMsg: ServerResponse,
): Promise<void> {
  try {
    await route(reqMsg, rspMsg)
  } catch (err) {
    console.error(`server error; ${err instanceof Error ? err.stack : err}`)
    writeJson<ErrorRsp>(
      500,
      {error: 'The S4U monitor could not complete', status: 500},
      rspMsg,
    )
  }
}

async function route(
  reqMsg: IncomingMessage,
  rspMsg: ServerResponse,
): Promise<void> {
  const endpoint = reqMsg.url?.slice(1) as Endpoint
  const method = EndpointMethod[endpoint]

  let rsp: AnyRsp
  if (method !== reqMsg.method) {
    rsp = {error: 'not found', status: 404}
  } else {
    switch (endpoint) {
      case Endpoint.OnMenuCheck:
        rsp = await routeMenuCheck()
        break
      case Endpoint.OnMenuEmailTest:
        rsp = await routeMenuEmailTest()
        break
      case Endpoint.OnMenuNotificationTest:
        rsp = await routeMenuNotificationTest()
        break
      case Endpoint.OnScheduledCheck:
        rsp = await routeScheduledCheck()
        break
      default:
        endpoint satisfies never
        rsp = {error: 'not found', status: 404}
        break
    }
  }

  writeJson<PartialJsonValue>('status' in rsp ? rsp.status : 200, rsp, rspMsg)
}

async function routeMenuCheck(): Promise<UiResponse> {
  const result = await runMonitor()
  let text: string
  if (result.newOffers === 0) {
    text = `Controllo completato: nessuna nuova offerta (${result.candidates} post esaminati).`
  } else if (!result.configured) {
    text = `${result.newOffers} offerte trovate; configura il subreddit di notifica.`
  } else if (result.sent) {
    text = `Notifica Modmail inviata con ${result.newOffers} nuove offerte S4U.`
  } else {
    text = `${result.newOffers} offerte trovate, ma nessuna notifica inviata.`
  }
  return {
    showToast: {text, appearance: 'success'},
  }
}

async function routeMenuNotificationTest(): Promise<UiResponse> {
  const delivery = await deliverTestNotification()
  return {
    showToast: {
      text: delivery.sent
        ? 'Notifica Modmail di prova inviata.'
        : 'Configura il subreddit di notifica prima del test.',
      appearance: delivery.sent ? 'success' : 'neutral',
    },
  }
}

async function routeMenuEmailTest(): Promise<UiResponse> {
  const delivery = await deliverTestEmail()
  return {
    showToast: {
      text: delivery.sent
        ? 'Email di prova inviata.'
        : 'Configura chiave Resend e destinatario prima del test.',
      appearance: delivery.sent ? 'success' : 'neutral',
    },
  }
}

async function routeScheduledCheck(): Promise<TaskResponse> {
  const now = new Date()
  if (!shouldRunScheduled(now)) {
    console.log('Skipping hourly task outside Europe/Rome target hours.')
    return {}
  }
  const result = await runMonitor(now)
  console.log(`Scheduled S4U monitor result: ${JSON.stringify(result)}`)
  return {}
}

function writeJson<T extends PartialJsonValue>(
  status: number,
  json: Readonly<T>,
  rsp: ServerResponse,
): void {
  const body = JSON.stringify(json)
  const len = Buffer.byteLength(body)
  rsp.writeHead(status, {
    'Content-Length': len,
    'Content-Type': 'application/json',
  })
  rsp.end(body)
}

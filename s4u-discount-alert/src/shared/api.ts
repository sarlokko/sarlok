export type ErrorRsp = {error: string; status: number}

export type Endpoint = (typeof Endpoint)[keyof typeof Endpoint]
export const Endpoint = {
  OnMenuCheck: 'internal/menu/check-s4u-discounts',
  OnMenuNotificationTest: 'internal/menu/send-notification-test',
  OnScheduledCheck: 'internal/scheduler/check-s4u-discounts',
} as const

export const EndpointMethod = {
  [Endpoint.OnMenuCheck]: 'POST',
  [Endpoint.OnMenuNotificationTest]: 'POST',
  [Endpoint.OnScheduledCheck]: 'POST',
} as const satisfies {[endpoint: string]: 'GET' | 'POST'}

import { postJson, getJson, BOOKING_V6_BASE_URL, BOOKING_V7_BASE_URL, BOOKING_TRACE_BASE_URL } from './http'

const BOOKING_HEADERS_BASE = { channelId: 'WEB', username: 'username' }

export function bookV6(payload, requestId) {
  return postJson('/booking', payload, {
    baseUrl: BOOKING_V6_BASE_URL,
    headers: { ...BOOKING_HEADERS_BASE, requestId },
  })
}

export function bookV7(payload, requestId) {
  return postJson('/booking', payload, {
    baseUrl: BOOKING_V7_BASE_URL,
    headers: { ...BOOKING_HEADERS_BASE, requestId },
  })
}

export function getBookingInternalApiTrace(requestId) {
  return getJson(`/${requestId}`, { baseUrl: BOOKING_TRACE_BASE_URL })
}

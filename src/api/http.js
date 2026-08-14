const BASE_URL = '/api/flight'

export const CART_BASE_URL = '/api/cart'

export const ANCILLARY_BASE_URL = '/api/ancillary-baggage'

export const ANCILLARY_MEAL_BASE_URL = '/api/ancillary-meal'

export const ANCILLARY_SEAT_BASE_URL = '/api/ancillary-seat'

export const FLIGHT_DECODE_BASE_URL = '/api/flight-decode'

export const BOOKING_V6_BASE_URL = '/api/booking-v6'

export const BOOKING_V7_BASE_URL = '/api/booking-v7'

export const BOOKING_TRACE_BASE_URL = '/api/booking-trace'

export class ApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.cause = cause
  }
}

function randomRequestId() {
  return Math.random().toString(36).slice(2, 12)
}

function defaultHeaders() {
  return {
    accept: 'application/json',
    storeId: 'TIKETCOM',
    channelId: 'DESKTOP',
    requestId: randomRequestId(),
    serviceId: 'gateway',
    username: 'GUEST',
    currency: 'IDR',
    isVerifiedPhoneNumber: 'false',
    'X-Loyalty-Level': 'LV1',
    'X-Currency': 'IDR',
    'X-Account-Id': '0',
    'X-Device-Id': 'deviceId',
    'Content-Type': 'application/json',
  }
}

export async function postJson(path, body, { baseUrl = BASE_URL, headers } = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { ...defaultHeaders(), ...headers },
      body: JSON.stringify(body),
    })
  } catch (cause) {
    // fetch() rejects with a TypeError for network failures, blocked mixed
    // content, and CORS rejections alike, and never exposes which one.
    throw new ApiError(
      `Network/CORS error calling ${path}. If the API host is not proxied, add it to the Vite dev server proxy in vite.config.js.`,
      { cause },
    )
  }

  const text = await response.text()
  const json = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ApiError(json?.message || `Request to ${path} failed with status ${response.status}`, {
      status: response.status,
      body: json,
    })
  }

  return json
}

export async function getJson(path, { baseUrl = BASE_URL, params, headers } = {}) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : ''
  let response
  try {
    response = await fetch(`${baseUrl}${path}${query}`, {
      method: 'GET',
      headers: { accept: 'application/json', ...headers },
    })
  } catch (cause) {
    throw new ApiError(
      `Network/CORS error calling ${path}. If the API host is not proxied, add it to the Vite dev server proxy in vite.config.js.`,
      { cause },
    )
  }

  const text = await response.text()
  const json = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ApiError(json?.message || `Request to ${path} failed with status ${response.status}`, {
      status: response.status,
      body: json,
    })
  }

  return json
}

const BASE_URL = '/api/flight'

export const CART_BASE_URL = '/api/cart'

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

export async function postJson(path, body, { baseUrl = BASE_URL } = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: defaultHeaders(),
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

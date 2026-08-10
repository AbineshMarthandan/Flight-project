import { getJson, ANCILLARY_BASE_URL, ANCILLARY_MEAL_BASE_URL, ANCILLARY_SEAT_BASE_URL } from './http'

function randomRequestId() {
  return `test-${Math.random().toString(36).slice(2, 10)}`
}

export function getBaggageSelection(cartId, { requestId = randomRequestId(), currency = 'IDR', lang = 'id' } = {}) {
  return getJson(`/v2/baggage/selection/${encodeURIComponent(cartId)}`, {
    baseUrl: ANCILLARY_BASE_URL,
    params: {
      XCurrency: currency,
      lang,
      requestId,
      'mandatoryRequest.requestId': requestId,
    },
  })
}

export function getMealsSelection(cartId, { requestId = randomRequestId(), currency = 'IDR', lang = 'id' } = {}) {
  return getJson(`/v2/meals/selection/${encodeURIComponent(cartId)}`, {
    baseUrl: ANCILLARY_MEAL_BASE_URL,
    params: {
      XCurrency: currency,
      lang,
      requestId,
      'mandatoryRequest.requestId': requestId,
    },
  })
}

export function getSeatsSelection(cartId, { requestId = randomRequestId(), currency = 'IDR', lang = 'id' } = {}) {
  return getJson(`/v2/seats/selection/${encodeURIComponent(cartId)}`, {
    baseUrl: ANCILLARY_SEAT_BASE_URL,
   params: {
      XCurrency: currency,
      lang,
      requestId,
      'mandatoryRequest.requestId': requestId,
    },
  })
}

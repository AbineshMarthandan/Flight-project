import { getJson, postJson, CART_BASE_URL } from './http'

function randomRequestId() {
  return Math.random().toString(36).slice(2, 12)
}

export function addToCart({ cartDetails, currency }) {
  return postJson(
    '/v5/cart',
    {
      cartDetails,
      currency,
      scale: 0,
      dcVar: true,
      itineraryType: 'MC',
    },
    { baseUrl: CART_BASE_URL },
  )
}

export function publishCartCreated(cartId) {
  return postJson('/__publish-cart', { cartId }, { baseUrl: '' })
}

export function getCart(cartId) {
  return getJson(`/v6/cart/${encodeURIComponent(cartId)}`, {
    baseUrl: CART_BASE_URL,
    headers: {
      storeId: 'TIKETCOM',
      channelId: 'DESKTOP',
      requestId: randomRequestId(),
      serviceId: 'gateway',
      username: 'GUEST',
      'X-Device-Id': 'deviceId',
    },
  })
}

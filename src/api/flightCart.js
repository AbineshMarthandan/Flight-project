import { postJson, CART_BASE_URL } from './http'

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

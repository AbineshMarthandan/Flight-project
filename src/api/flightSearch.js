import { postJson, FLIGHT_DECODE_BASE_URL } from './http'

export function searchMultiCity({ adult, child, infant, cabinClass, routes }) {
  return postJson('/search/multi-city', {
    adult,
    child,
    infant,
    cabinClass,
    searchType: 'MULTI_CITY',
    resultType: 'DEPARTURE',
    routes,
  })
}

export function streamLeg(requestItems) {
  return postJson('/search/multi-city/streaming', { requestItems })
}

export function searchNextLeg({ segment, cabinClass, flightDetails, allRoutes, adult, child, infant }) {
  return postJson('/search/multi-city/next', {
    segment,
    cabinClass,
    resultType: 'DEPARTURE',
    flightDetails,
    allRoutes,
    adult,
    child,
    infant,
  })
}

export function getFlightDetail(details) {
  return postJson('/multi-city/flight-detail', {
    details,
    departurePrice: 0,
    itineraryType: 'MULTI_CITY',
    dcVar: true,
  })
}

export function decodeSupplierStrings(strings) {
  return postJson(
    '/base64/decodes',
    { strings },
    { baseUrl: FLIGHT_DECODE_BASE_URL, headers: { channelId: 'WEB', username: 'username' } },
  )
}

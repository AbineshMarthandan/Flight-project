import { postJson } from './http'

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

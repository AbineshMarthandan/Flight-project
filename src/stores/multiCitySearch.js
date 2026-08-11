import { defineStore } from 'pinia'
import { searchMultiCity, streamLeg, searchNextLeg, getFlightDetail } from '@/api/flightSearch'
import { addToCart as addToCartApi, getCart } from '@/api/flightCart'
import { getBaggageSelection, getMealsSelection, getSeatsSelection } from '@/api/flightAncillary'

function emptyRoute() {
  return { origin: '', destination: '', departureDate: '', comboMC: false }
}

// Reference chains built only from the origin/destination pairs actually
// supported (per the routes we've been given). Only CGK, DPS, SUB and UPG
// ever appear as an origin in that list, and DPS<->SUB is the only pair that
// links back to each other — so chains longer than 4 legs must revisit DPS/SUB
// to keep every leg on a supported route; there's no way around that with
// this route set.
const REFERENCE_CHAINS = {
  2: [
    ['CGK', 'KUL'],
    ['KUL', 'SIN'],
  ],
  3: [
    ['CGK', 'KUL'],
    ['KUL', 'SIN'],
    ['SIN', 'CGK'],
  ],
  4: [
    ['CGK', 'DPS'],
    ['DPS', 'SUB'],
    ['SUB', 'UPG'],
    ['UPG', 'BPN'],
  ],
  5: [
    ['CGK', 'DPS'],
    ['DPS', 'SUB'],
    ['SUB', 'DPS'],
    ['DPS', 'UPG'],
    ['UPG', 'BPN'],
  ],
  6: [
    ['CGK', 'DPS'],
    ['DPS', 'SUB'],
    ['SUB', 'DPS'],
    ['DPS', 'SUB'],
    ['SUB', 'UPG'],
    ['UPG', 'KNO'],
  ],
  7: [
    ['CGK', 'DPS'],
    ['DPS', 'SUB'],
    ['SUB', 'DPS'],
    ['DPS', 'SUB'],
    ['SUB', 'DPS'],
    ['DPS', 'UPG'],
    ['UPG', 'BPN'],
  ],
}

function buildReferenceRoutes(count) {
  return REFERENCE_CHAINS[count].map(([origin, destination], i) => ({
    origin,
    destination,
    departureDate: `2026-11-${String(i + 1).padStart(2, '0')}`,
    comboMC: false,
  }))
}

// Splits a comma-separated "airasia, sabre" style input into trimmed,
// lowercased, non-empty terms.
function parseSupplierTerms(supplierText) {
  return supplierText
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)
}

function matchesAnySupplierTerm(flight, supplierTerms) {
  if (!supplierTerms.length) return true
  const haystack = JSON.stringify(flight).toLowerCase()
  return supplierTerms.some((term) => haystack.includes(term))
}

function filterCandidates(departureFlights, { wantsComboMC, supplierTerms }) {
  if (!departureFlights?.length) return []

  if (!wantsComboMC && !supplierTerms.length) return departureFlights

  return departureFlights.filter((f) => {
    if (wantsComboMC && f.comboMC !== true) return false
    if (!matchesAnySupplierTerm(f, supplierTerms)) return false
    return true
  })
}

// Called only when filterCandidates() found nothing, to explain which of the
// active filters (alone or in combination) is responsible.
function describeFilterMismatch(departureFlights, { wantsComboMC, supplierText, supplierTerms }) {
  const parts = []

  if (wantsComboMC) {
    const count = departureFlights.filter((f) => f.comboMC === true).length
    parts.push(`"Combo MC only" alone matches ${count} flight(s)`)
  }

  if (supplierTerms.length) {
    const count = departureFlights.filter((f) => matchesAnySupplierTerm(f, supplierTerms)).length
    parts.push(`"Supplier contains ‘${supplierText}’" alone matches ${count} flight(s)`)
  }

  if (parts.length > 1) {
    return `${parts.join(', and ')} — but no flight satisfies both filters at once.`
  }
  return `${parts[0]}, but that field wasn't set on any flight for this leg.`
}

function buildSteps(legCount) {
  const steps = [{ key: 'search', label: 'Search multi-city', status: 'pending' }]
  for (let i = 1; i <= legCount; i++) {
    if (i > 1) steps.push({ key: `search-${i}`, label: `Search leg ${i}`, status: 'pending' })
    steps.push({ key: `stream-${i}`, label: `Stream leg ${i}`, status: 'pending' })
    steps.push({ key: `select-${i}`, label: `Choose leg ${i} flight`, status: 'pending' })
  }
  steps.push({ key: 'detail', label: 'Flight detail', status: 'pending' })
  return steps
}

export const useMultiCitySearchStore = defineStore('multiCitySearch', {
  state: () => ({
    adult: 1,
    child: 0,
    infant: 0,
    cabinClass: 'ECONOMY',
    routes: buildReferenceRoutes(2),
    filters: {
      supplierEnabled: false,
      supplier: '',
    },
    status: 'idle', // idle | running | awaiting-selection | done | error
    steps: [],
    legs: [],
    currentSegment: 0,
    candidates: [],
    requestItems: null,
    flightDetail: null,
    error: null,
    addingToCart: false,
    cartId: null,
    cartResponse: null,
    cartError: null,
    cartFetchLoading: false,
    cartFetchResponse: null,
    cartFetchError: null,
    baggageLoading: false,
    baggageResponse: null,
    baggageError: null,
    mealLoading: false,
    mealResponse: null,
    mealError: null,
    seatLoading: false,
    seatResponse: null,
    seatError: null,
  }),
  actions: {
    addRoute() {
      this.routes.push(emptyRoute())
    },
    removeRoute(index) {
      if (this.routes.length <= 2) return
      this.routes.splice(index, 1)
    },
    setRouteCount(count) {
      this.routes = buildReferenceRoutes(count)
    },
    setStepStatus(key, status, error) {
      const step = this.steps.find((s) => s.key === key)
      if (step) {
        step.status = status
        if (error) step.error = error
      }
    },
    passengers() {
      return { adult: this.adult, child: this.child, infant: this.infant }
    },
    reset() {
      this.status = 'idle'
      this.steps = []
      this.legs = []
      this.currentSegment = 0
      this.candidates = []
      this.requestItems = null
      this.flightDetail = null
      this.error = null
      this.addingToCart = false
      this.cartId = null
      this.cartResponse = null
      this.cartError = null
      this.cartFetchLoading = false
      this.cartFetchResponse = null
      this.cartFetchError = null
    },
    fail(err) {
      const activeStep = this.steps.find((s) => s.status === 'active')
      if (activeStep) this.setStepStatus(activeStep.key, 'error', err.message)
      this.error = err.message || 'Something went wrong'
      this.status = 'error'
    },
    async startSearch() {
      this.reset()
      this.status = 'running'
      this.steps = buildSteps(this.routes.length)

      try {
        this.setStepStatus('search', 'active')
        const searchRes = await searchMultiCity({
          ...this.passengers(),
          cabinClass: this.cabinClass,
          routes: this.routes,
        })
        this.setStepStatus('search', 'done')
        this.requestItems = searchRes.data.requestItems

        await this.streamSegment(1)
      } catch (err) {
        this.fail(err)
      }
    },
    // Streams a leg's flight list and pauses for manual selection instead of
    // auto-picking one — the user chooses which flight to proceed with.
    async streamSegment(segment) {
      const streamKey = `stream-${segment}`
      this.setStepStatus(streamKey, 'active')
      const streamRes = await streamLeg(this.requestItems)
      const departureFlights = streamRes.data.searchList.departureFlights

      const wantsComboMC = !!this.routes[segment - 1]?.comboMC
      const supplierText = this.filters.supplierEnabled ? this.filters.supplier.trim() : ''
      const supplierTerms = parseSupplierTerms(supplierText)

      const candidates = filterCandidates(departureFlights, { wantsComboMC, supplierTerms })

      if (!candidates.length) {
        const filtersActive = wantsComboMC || supplierTerms.length > 0
        throw new Error(
          filtersActive
            ? `No flight matched the selected filters for leg ${segment}: ${describeFilterMismatch(departureFlights, { wantsComboMC, supplierText, supplierTerms })}`
            : `No flights returned for leg ${segment}`,
        )
      }

      this.setStepStatus(streamKey, 'done')
      this.currentSegment = segment
      this.candidates = candidates
      this.setStepStatus(`select-${segment}`, 'active')
      this.status = 'awaiting-selection'
    },
    async selectFlight(flight) {
      const segment = this.currentSegment
      this.legs.push({
        segment,
        flightId: flight.flightId,
        supplierId: flight.supplierId,
        comboMC: flight.comboMC,
        paxPrice: flight.trackerProperties?.price,
        departureTime: flight.card?.departure?.time,
        arrivalTime: flight.card?.arrival?.time,
        route: this.routes[segment - 1],
      })
      this.setStepStatus(`select-${segment}`, 'done')
      this.candidates = []
      this.status = 'running'

      try {
        if (segment < this.routes.length) {
          const nextSegment = segment + 1
          const stepKey = `search-${nextSegment}`
          this.setStepStatus(stepKey, 'active')
          const flightDetails = this.legs.map((leg) => ({
            segment: leg.segment,
            paxPrice: leg.paxPrice,
            flightId: leg.flightId,
            comboMC: leg.comboMC,
            supplierId: leg.supplierId,
            departureTime: leg.departureTime,
            arrivalTime: leg.arrivalTime,
          }))
          const nextRes = await searchNextLeg({
            segment: nextSegment,
            cabinClass: this.cabinClass,
            flightDetails,
            allRoutes: this.routes,
            ...this.passengers(),
          })
          this.requestItems = nextRes.data.requestItems
          this.setStepStatus(stepKey, 'done')

          await this.streamSegment(nextSegment)
        } else {
          this.setStepStatus('detail', 'active')
          const details = this.legs.map((leg) => ({
            flightId: leg.flightId,
            comboMC: leg.comboMC,
            supplierId: leg.supplierId,
            fullRefundReschedule: false,
            fullRefundCredentialCode: '',
            fareBasisCode: '',
            journeyType: 'DEPARTURE',
          }))
          const detailRes = await getFlightDetail(details)
          this.flightDetail = detailRes.data
          this.setStepStatus('detail', 'done')
          this.status = 'done'
        }
      } catch (err) {
        this.fail(err)
      }
    },
    async addToCart() {
      this.addingToCart = true
      this.cartError = null
      this.cartId = null
      this.cartResponse = null
      try {
        const cartDetails = this.legs.map((leg) => ({
          flightId: leg.flightId,
          supplierRequest: { supplierId: leg.supplierId },
          isFullRefund: false,
          fullRefundCredentialCode: 'tiket-basic-internal',
          fareBasisCode: '',
          comboMC: leg.comboMC,
        }))
        const res = await addToCartApi({ cartDetails, currency: 'IDR' })
        this.cartId = res.data.cartId
        this.cartResponse = res.data
      } catch (err) {
        this.cartError = err.message || 'Failed to add to cart'
      } finally {
        this.addingToCart = false
      }
    },
    async fetchCart() {
      if (!this.cartId) {
        this.cartFetchError = 'No cart ID yet — add a flight to your cart first.'
        return
      }
      this.cartFetchLoading = true
      this.cartFetchError = null
      this.cartFetchResponse = null
      try {
        const res = await getCart(this.cartId)
        this.cartFetchResponse = res.data
      } catch (err) {
        this.cartFetchError = err.message || 'Failed to fetch cart'
      } finally {
        this.cartFetchLoading = false
      }
    },
    async fetchBaggage() {
      if (!this.cartId) {
        this.baggageError = 'No cart ID yet — add a flight to your cart first.'
        return
      }
      this.baggageLoading = true
      this.baggageError = null
      this.baggageResponse = null
      try {
        const res = await getBaggageSelection(this.cartId)
        this.baggageResponse = res.data
      } catch (err) {
        this.baggageError = err.message || 'Failed to fetch baggage options'
      } finally {
        this.baggageLoading = false
      }
    },
    async fetchMeals() {
      if (!this.cartId) {
        this.mealError = 'No cart ID yet — add a flight to your cart first.'
        return
      }
      this.mealLoading = true
      this.mealError = null
      this.mealResponse = null
      try {
        const res = await getMealsSelection(this.cartId)
        this.mealResponse = res.data
      } catch (err) {
        this.mealError = err.message || 'Failed to fetch meal options'
      } finally {
        this.mealLoading = false
      }
    },
    async fetchSeats() {
      if (!this.cartId) {
        this.seatError = 'No cart ID yet — add a flight to your cart first.'
        return
      }
      this.seatLoading = true
      this.seatError = null
      this.seatResponse = null
      try {
        const res = await getSeatsSelection(this.cartId)
        this.seatResponse = res.data
      } catch (err) {
        this.seatError = err.message || 'Failed to fetch seat options'
      } finally {
        this.seatLoading = false
      }
    },
  },
})

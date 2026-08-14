import { defineStore } from 'pinia'
import { searchMultiCity, streamLeg, searchNextLeg, getFlightDetail, decodeSupplierStrings } from '@/api/flightSearch'
import { addToCart as addToCartApi, getCart } from '@/api/flightCart'
import { getBaggageSelection, getMealsSelection, getSeatsSelection } from '@/api/flightAncillary'
import { bookV6, bookV7, getBookingInternalApiTrace } from '@/api/flightBooking'

function generateBookingRequestId() {
  return `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Preloaded pax pools for the booking payload — up to 5 of each type, so a
// search for e.g. 3 adults / 2 children / 1 infant can generate that many pax
// records without the user typing them by hand. Counts beyond 5 cycle the pool.
const SAMPLE_ADULTS = [
  {
    fullName: 'Dono Kasino',
    firstName: 'Dono',
    lastName: 'Kasino',
    title: 'Mr',
    dob: '1988-02-01',
    profileId: '32724735',
    nationality: 'IN',
    passportNo: '22929292',
    passportExpiry: '2030-11-07',
    issuingDate: '2020-11-07',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Siti Aminah',
    firstName: 'Siti',
    lastName: 'Aminah',
    title: 'Mrs',
    dob: '1990-05-14',
    profileId: '32724736',
    nationality: 'IN',
    passportNo: '22929293',
    passportExpiry: '2030-05-14',
    issuingDate: '2020-05-14',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Budi Santoso',
    firstName: 'Budi',
    lastName: 'Santoso',
    title: 'Mr',
    dob: '1985-11-23',
    profileId: '32724737',
    nationality: 'IN',
    passportNo: '22929294',
    passportExpiry: '2029-11-23',
    issuingDate: '2019-11-23',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Rina Wijaya',
    firstName: 'Rina',
    lastName: 'Wijaya',
    title: 'Mrs',
    dob: '1992-07-09',
    profileId: '32724738',
    nationality: 'IN',
    passportNo: '22929295',
    passportExpiry: '2031-07-09',
    issuingDate: '2021-07-09',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Agus Prasetyo',
    firstName: 'Agus',
    lastName: 'Prasetyo',
    title: 'Mr',
    dob: '1979-03-30',
    profileId: '32724739',
    nationality: 'IN',
    passportNo: '22929296',
    passportExpiry: '2028-03-30',
    issuingDate: '2018-03-30',
    issuingCountry: 'IN',
  },
]

const SAMPLE_CHILDREN = [
  {
    fullName: 'Bayu Kasino',
    firstName: 'Bayu',
    lastName: 'Kasino',
    title: 'MSTR',
    dob: '2018-06-15',
    profileId: '32724740',
    nationality: 'IN',
    passportNo: '22929297',
    passportExpiry: '2028-06-15',
    issuingDate: '2023-06-15',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Dewi Santoso',
    firstName: 'Dewi',
    lastName: 'Santoso',
    title: 'MISS',
    dob: '2016-09-22',
    profileId: '32724741',
    nationality: 'IN',
    passportNo: '22929298',
    passportExpiry: '2028-09-22',
    issuingDate: '2023-09-22',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Rizki Wijaya',
    firstName: 'Rizki',
    lastName: 'Wijaya',
    title: 'MSTR',
    dob: '2019-01-10',
    profileId: '32724742',
    nationality: 'IN',
    passportNo: '22929299',
    passportExpiry: '2029-01-10',
    issuingDate: '2024-01-10',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Putri Aminah',
    firstName: 'Putri',
    lastName: 'Aminah',
    title: 'MISS',
    dob: '2017-12-05',
    profileId: '32724743',
    nationality: 'IN',
    passportNo: '22929300',
    passportExpiry: '2027-12-05',
    issuingDate: '2022-12-05',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Fajar Prasetyo',
    firstName: 'Fajar',
    lastName: 'Prasetyo',
    title: 'MSTR',
    dob: '2015-04-18',
    profileId: '32724744',
    nationality: 'IN',
    passportNo: '22929301',
    passportExpiry: '2029-04-18',
    issuingDate: '2024-04-18',
    issuingCountry: 'IN',
  },
]

const SAMPLE_INFANTS = [
  {
    fullName: 'Nadia Kasino',
    firstName: 'Nadia',
    lastName: 'Kasino',
    title: 'MISS',
    dob: '2025-03-01',
    profileId: '32724745',
    nationality: 'IN',
    passportNo: '22929302',
    passportExpiry: '2030-03-01',
    issuingDate: '2025-03-01',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Arif Santoso',
    firstName: 'Arif',
    lastName: 'Santoso',
    title: 'MSTR',
    dob: '2025-08-20',
    profileId: '32724746',
    nationality: 'IN',
    passportNo: '22929303',
    passportExpiry: '2030-08-20',
    issuingDate: '2025-08-20',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Lestari Wijaya',
    firstName: 'Lestari',
    lastName: 'Wijaya',
    title: 'MISS',
    dob: '2026-01-15',
    profileId: '32724747',
    nationality: 'IN',
    passportNo: '22929304',
    passportExpiry: '2031-01-15',
    issuingDate: '2026-01-15',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Yusuf Aminah',
    firstName: 'Yusuf',
    lastName: 'Aminah',
    title: 'MSTR',
    dob: '2024-11-30',
    profileId: '32724748',
    nationality: 'IN',
    passportNo: '22929305',
    passportExpiry: '2029-11-30',
    issuingDate: '2024-11-30',
    issuingCountry: 'IN',
  },
  {
    fullName: 'Citra Prasetyo',
    firstName: 'Citra',
    lastName: 'Prasetyo',
    title: 'MISS',
    dob: '2025-06-10',
    profileId: '32724749',
    nationality: 'IN',
    passportNo: '22929306',
    passportExpiry: '2030-06-10',
    issuingDate: '2025-06-10',
    issuingCountry: 'IN',
  },
]

function buildPaxList(pool, count) {
  const safeCount = Math.max(0, count || 0)
  if (!safeCount) return []
  return Array.from({ length: safeCount }, (_, i) => pool[i % pool.length])
}

const SAMPLE_BOOKING_V6_PAYLOAD = {
  cartId: '6a7c708415abb1611698b0cd',
  contact: {
    fullName: 'Dono Kasino',
    title: 'mr',
    areaCode: '+62',
    phone: '878555152',
    email: 'testing@tiket.com',
    profileId: '32724735',
  },
  adults: buildPaxList(SAMPLE_ADULTS, 1),
  childs: [],
  infants: [],
  multiInsurances: [],
  claimVouchers: [],
  scale: 0,
  promoData: null,
}

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
    ['CGK', 'KUL'],
    ['KUL', 'NRT'],
    ['NRT', 'KUL'],
    ['KUL', 'CGK'],
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
    supplierNames: {},
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
    bookingV6PayloadText: JSON.stringify(SAMPLE_BOOKING_V6_PAYLOAD, null, 2),
    bookingV6Loading: false,
    bookingV6Request: null,
    bookingV6Response: null,
    bookingV6Error: null,
    bookingV6RequestId: null,
    bookingV6TraceLoading: false,
    bookingV6Trace: null,
    bookingV6TraceError: null,
    bookingV7PayloadText: '',
    bookingV7Loading: false,
    bookingV7Request: null,
    bookingV7Response: null,
    bookingV7Error: null,
    bookingV7RequestId: null,
    bookingV7TraceLoading: false,
    bookingV7Trace: null,
    bookingV7TraceError: null,
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
      this.decodeSuppliers(candidates.map((f) => f.supplierId))
      this.setStepStatus(`select-${segment}`, 'active')
      this.status = 'awaiting-selection'
    },
    async decodeSuppliers(ids) {
      const uniqueIds = [...new Set(ids.filter((id) => id && !this.supplierNames[id]))]
      if (!uniqueIds.length) return
      try {
        const strippedIds = uniqueIds.map((id) => id.replace(/-ENC$/, ''))
        const res = await decodeSupplierStrings(strippedIds)
        const decoded = res?.data?.strings ?? (Array.isArray(res?.data) ? res.data : null) ?? res?.strings ?? []
        uniqueIds.forEach((id, i) => {
          if (decoded[i]) this.supplierNames[id] = decoded[i]
        })
      } catch {
        // Cosmetic enhancement only — leave the raw supplier id displayed on failure.
      }
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
        this.syncCartIdIntoBookingPayloads()
      } catch (err) {
        this.cartError = err.message || 'Failed to add to cart'
        this.cartResponse = err.body ?? null
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
    // Keeps the booking payload textareas pointed at whichever cart is
    // actually active, without touching any other field the user may have
    // edited by hand. Called right after a cart is created, and again on
    // mount of each Booking view in case a cart already existed by then.
    syncCartIdIntoBookingPayloads() {
      if (!this.cartId) return
      for (const key of ['bookingV6PayloadText', 'bookingV7PayloadText']) {
        const trimmed = this[key].trim()
        if (!trimmed) continue
        let payload
        try {
          payload = JSON.parse(trimmed)
        } catch {
          continue
        }
        payload.cartId = this.cartId
        this[key] = JSON.stringify(payload, null, 2)
      }
    },
    fillBookingV6Passengers() {
      this.bookingV6Error = null
      const trimmed = this.bookingV6PayloadText.trim()
      let payload = {}
      if (trimmed) {
        try {
          payload = JSON.parse(trimmed)
        } catch {
          this.bookingV6Error = 'Payload is not valid JSON — fix it before filling passengers.'
          return
        }
      }
      payload.adults = buildPaxList(SAMPLE_ADULTS, this.adult)
      payload.childs = buildPaxList(SAMPLE_CHILDREN, this.child)
      payload.infants = buildPaxList(SAMPLE_INFANTS, this.infant)
      this.bookingV6PayloadText = JSON.stringify(payload, null, 2)
    },
    async submitBookingV6() {
      this.bookingV6Error = null
      this.bookingV6Response = null
      this.bookingV6Trace = null
      this.bookingV6TraceError = null
      let payload
      try {
        payload = JSON.parse(this.bookingV6PayloadText)
      } catch {
        this.bookingV6Error = 'Payload is not valid JSON'
        return
      }
      const requestId = generateBookingRequestId()
      this.bookingV6RequestId = requestId
      this.bookingV6Request = payload
      this.bookingV6Loading = true
      try {
        const res = await bookV6(payload, requestId)
        this.bookingV6Response = res.data
      } catch (err) {
        this.bookingV6Error = err.message || 'Booking v6 call failed'
      } finally {
        this.bookingV6Loading = false
      }
    },
    async fetchBookingV6Trace() {
      if (!this.bookingV6RequestId) {
        this.bookingV6TraceError = 'No booking request yet — click Book first.'
        return
      }
      this.bookingV6TraceLoading = true
      this.bookingV6TraceError = null
      try {
        const res = await getBookingInternalApiTrace(this.bookingV6RequestId)
        this.bookingV6Trace = res.data
      } catch (err) {
        this.bookingV6TraceError = err.message || 'Failed to fetch internal API trace'
      } finally {
        this.bookingV6TraceLoading = false
      }
    },
    fillBookingV7Passengers() {
      this.bookingV7Error = null
      const trimmed = this.bookingV7PayloadText.trim()
      let payload = {}
      if (trimmed) {
        try {
          payload = JSON.parse(trimmed)
        } catch {
          this.bookingV7Error = 'Payload is not valid JSON — fix it before filling passengers.'
          return
        }
      }
      payload.adults = buildPaxList(SAMPLE_ADULTS, this.adult)
      payload.childs = buildPaxList(SAMPLE_CHILDREN, this.child)
      payload.infants = buildPaxList(SAMPLE_INFANTS, this.infant)
      this.bookingV7PayloadText = JSON.stringify(payload, null, 2)
    },
    async submitBookingV7() {
      this.bookingV7Error = null
      this.bookingV7Response = null
      this.bookingV7Trace = null
      this.bookingV7TraceError = null
      let payload
      try {
        payload = JSON.parse(this.bookingV7PayloadText)
      } catch {
        this.bookingV7Error = 'Payload is not valid JSON'
        return
      }
      const requestId = generateBookingRequestId()
      this.bookingV7RequestId = requestId
      this.bookingV7Request = payload
      this.bookingV7Loading = true
      try {
        const res = await bookV7(payload, requestId)
        this.bookingV7Response = res.data
      } catch (err) {
        this.bookingV7Error = err.message || 'Booking v7 call failed'
      } finally {
        this.bookingV7Loading = false
      }
    },
    async fetchBookingV7Trace() {
      if (!this.bookingV7RequestId) {
        this.bookingV7TraceError = 'No booking request yet — click Book first.'
        return
      }
      this.bookingV7TraceLoading = true
      this.bookingV7TraceError = null
      try {
        const res = await getBookingInternalApiTrace(this.bookingV7RequestId)
        this.bookingV7Trace = res.data
      } catch (err) {
        this.bookingV7TraceError = err.message || 'Failed to fetch internal API trace'
      } finally {
        this.bookingV7TraceLoading = false
      }
    },
  },
})

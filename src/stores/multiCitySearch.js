import { defineStore } from 'pinia'
import { searchMultiCity, streamLeg, searchNextLeg, getFlightDetail } from '@/api/flightSearch'
import { addToCart as addToCartApi } from '@/api/flightCart'

function emptyRoute() {
  return { origin: '', destination: '', departureDate: '' }
}

function pickFlight(departureFlights, filters) {
  if (!departureFlights?.length) return null

  const wantsComboMC = !!filters?.comboMC
  const supplierNeedle = filters?.supplierEnabled ? filters.supplier.trim().toLowerCase() : ''

  if (wantsComboMC || supplierNeedle) {
    return (
      departureFlights.find((f) => {
        if (wantsComboMC && f.comboMC !== true) return false
        if (supplierNeedle && !JSON.stringify(f).toLowerCase().includes(supplierNeedle)) return false
        return true
      }) ?? null
    )
  }

  return departureFlights.find((f) => f.comboMC === false) ?? departureFlights[0]
}

// Called only when pickFlight() found nothing, to explain which of the
// active filters (alone or in combination) is responsible.
function describeFilterMismatch(departureFlights, filters) {
  const parts = []

  if (filters.comboMC) {
    const count = departureFlights.filter((f) => f.comboMC === true).length
    parts.push(`"Combo MC only" alone matches ${count} flight(s)`)
  }

  const supplierText = filters.supplierEnabled ? filters.supplier.trim() : ''
  if (supplierText) {
    const needle = supplierText.toLowerCase()
    const count = departureFlights.filter((f) => JSON.stringify(f).toLowerCase().includes(needle)).length
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
    routes: [emptyRoute(), emptyRoute()],
    filters: {
      comboMC: false,
      supplierEnabled: false,
      supplier: '',
    },
    status: 'idle', // idle | running | done | error
    steps: [],
    legs: [],
    flightDetail: null,
    error: null,
    addingToCart: false,
    cartId: null,
    cartError: null,
  }),
  actions: {
    addRoute() {
      this.routes.push(emptyRoute())
    },
    removeRoute(index) {
      if (this.routes.length <= 2) return
      this.routes.splice(index, 1)
    },
    setStepStatus(key, status, error) {
      const step = this.steps.find((s) => s.key === key)
      if (step) {
        step.status = status
        if (error) step.error = error
      }
    },
    reset() {
      this.status = 'idle'
      this.steps = []
      this.legs = []
      this.flightDetail = null
      this.error = null
      this.addingToCart = false
      this.cartId = null
      this.cartError = null
    },
    async run() {
      this.reset()
      this.status = 'running'
      this.steps = buildSteps(this.routes.length)

      const passengers = { adult: this.adult, child: this.child, infant: this.infant }

      try {
        this.setStepStatus('search', 'active')
        const searchRes = await searchMultiCity({
          ...passengers,
          cabinClass: this.cabinClass,
          routes: this.routes,
        })
        this.setStepStatus('search', 'done')

        let requestItems = searchRes.data.requestItems

        for (let segment = 1; segment <= this.routes.length; segment++) {
          if (segment > 1) {
            const stepKey = `search-${segment}`
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
              segment,
              cabinClass: this.cabinClass,
              flightDetails,
              allRoutes: this.routes,
              ...passengers,
            })
            requestItems = nextRes.data.requestItems
            this.setStepStatus(stepKey, 'done')
          }

          const streamKey = `stream-${segment}`
          this.setStepStatus(streamKey, 'active')
          const streamRes = await streamLeg(requestItems)
          const departureFlights = streamRes.data.searchList.departureFlights
          const flight = pickFlight(departureFlights, this.filters)
          if (!flight) {
            const filtersActive = this.filters.comboMC || (this.filters.supplierEnabled && this.filters.supplier.trim())
            throw new Error(
              filtersActive
                ? `No flight matched the selected filters for leg ${segment}: ${describeFilterMismatch(departureFlights, this.filters)}`
                : `No flights returned for leg ${segment}`,
            )
          }
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
          this.setStepStatus(streamKey, 'done')
        }

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
      } catch (err) {
        const activeStep = this.steps.find((s) => s.status === 'active')
        if (activeStep) this.setStepStatus(activeStep.key, 'error', err.message)
        this.error = err.message || 'Something went wrong'
        this.status = 'error'
      }
    },
    async addToCart() {
      this.addingToCart = true
      this.cartError = null
      this.cartId = null
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
      } catch (err) {
        this.cartError = err.message || 'Failed to add to cart'
      } finally {
        this.addingToCart = false
      }
    },
  },
})

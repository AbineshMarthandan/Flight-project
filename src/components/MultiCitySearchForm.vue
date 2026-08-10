<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import RouteRow from './RouteRow.vue'
import FlightFilters from './FlightFilters.vue'

const store = useMultiCitySearchStore()

function isValid() {
  return (
    store.routes.length >= 2 &&
    store.routes.every((r) => r.origin.trim().length === 3 && r.destination.trim().length === 3 && r.departureDate)
  )
}

function onSubmit() {
  if (!isValid() || store.status === 'running') return
  store.run()
}
</script>

<template>
  <form class="search-form" @submit.prevent="onSubmit">
    <div class="search-form__passengers">
      <label>
        Adult
        <input v-model.number="store.adult" type="number" min="1" max="9" />
      </label>
      <label>
        Child
        <input v-model.number="store.child" type="number" min="0" max="9" />
      </label>
      <label>
        Infant
        <input v-model.number="store.infant" type="number" min="0" max="9" />
      </label>
      <label>
        Cabin
        <select v-model="store.cabinClass">
          <option value="ECONOMY">Economy</option>
          <option value="PREMIUM_ECONOMY">Premium Economy</option>
          <option value="BUSINESS">Business</option>
          <option value="FIRST">First</option>
        </select>
      </label>
    </div>

    <div class="search-form__routes">
      <RouteRow
        v-for="(route, i) in store.routes"
        :key="i"
        :model-value="route"
        :index="i"
        :removable="store.routes.length > 2"
        @remove="store.removeRoute(i)"
      />
    </div>

    <FlightFilters />

    <div class="search-form__actions">
      <button type="button" class="btn btn--ghost" @click="store.addRoute">+ Add leg</button>
      <button type="submit" class="btn btn--primary" :disabled="!isValid() || store.status === 'running'">
        {{ store.status === 'running' ? 'Searching…' : 'Search flights' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.search-form {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
}
.search-form__passengers {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}
.search-form__passengers label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #4b5563;
}
.search-form__passengers input,
.search-form__passengers select {
  width: 6rem;
  padding: 0.4rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.search-form__actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
.btn {
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn--primary {
  background: #4338ca;
  color: #fff;
}
.btn--primary:disabled {
  background: #a5a6f0;
  cursor: not-allowed;
}
.btn--ghost {
  background: #fff;
  border-color: #d1d5db;
  color: #374151;
}
</style>

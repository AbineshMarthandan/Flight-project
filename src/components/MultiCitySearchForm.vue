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

function isBusy() {
  return store.status === 'running' || store.status === 'awaiting-selection'
}

function onSubmit() {
  if (!isValid() || isBusy()) return
  store.startSearch()
}
</script>

<template>
  <form class="search-form" @submit.prevent="onSubmit">
    <div class="search-form__passengers">
      <label>
        Routes
        <select
          class="search-form__route-count"
          :value="store.routes.length"
          @change="store.setRouteCount(Number($event.target.value))"
        >
          <option v-for="n in [2, 3, 4, 5, 6, 7]" :key="n" :value="n">{{ n }} routes</option>
        </select>
      </label>
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
      <button type="submit" class="btn btn--primary" :disabled="!isValid() || isBusy()">
        {{ isBusy() ? 'Searching…' : 'Search flights' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.search-form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}
.search-form__passengers {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-soft);
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
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.15s ease;
}
.search-form__passengers input:focus,
.search-form__passengers select:focus {
  outline: none;
  border-color: var(--color-accent);
}
.search-form__route-count {
  width: 7.5rem;
}
.search-form__actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
}
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.btn--primary:not(:disabled):hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
.btn--primary:disabled {
  background: var(--color-accent-disabled);
  cursor: not-allowed;
}
.btn--ghost {
  background: var(--color-surface);
  border-color: var(--color-input-border);
  color: var(--color-text-body);
}
.btn--ghost:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>

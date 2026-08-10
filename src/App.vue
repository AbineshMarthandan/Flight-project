<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import MultiCitySearchForm from '@/components/MultiCitySearchForm.vue'
import SearchSteps from '@/components/SearchSteps.vue'
import LegResults from '@/components/LegResults.vue'
import FlightDetailResult from '@/components/FlightDetailResult.vue'
import CartPanel from '@/components/CartPanel.vue'

const store = useMultiCitySearchStore()
</script>

<template>
  <main class="page">
    <header class="page__header">
      <h1>Multi-city flight search</h1>
      <p>Add each leg of your trip, then search — every step streams live below.</p>
    </header>

    <MultiCitySearchForm />

    <section v-if="store.status !== 'idle'" class="page__progress">
      <SearchSteps :steps="store.steps" />
    </section>

    <p v-if="store.status === 'error'" class="page__error">{{ store.error }}</p>

    <section v-if="store.legs.length" class="page__section">
      <h2>Selected flights</h2>
      <LegResults :legs="store.legs" />
    </section>

    <section v-if="store.flightDetail" class="page__section">
      <FlightDetailResult :detail="store.flightDetail" />
      <CartPanel />
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
  color: #111827;
}
.page__header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}
.page__header p {
  color: #6b7280;
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
}
.page__progress {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-top: 1.25rem;
}
.page__error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 0.85rem;
}
.page__section {
  margin-top: 1.5rem;
}
.page__section h2 {
  font-size: 1rem;
  margin-bottom: 0.6rem;
}
</style>

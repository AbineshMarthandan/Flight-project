<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import MultiCitySearchForm from '@/components/MultiCitySearchForm.vue'
import SearchSteps from '@/components/SearchSteps.vue'
import LegResults from '@/components/LegResults.vue'
import FlightDetailResult from '@/components/FlightDetailResult.vue'

const store = useMultiCitySearchStore()
</script>

<template>
  <div>
    <MultiCitySearchForm />

    <section v-if="store.status !== 'idle'" class="view-panel">
      <SearchSteps :steps="store.steps" />
    </section>

    <p v-if="store.status === 'error'" class="view-error">{{ store.error }}</p>

    <section v-if="store.legs.length" class="view-section">
      <h2>Selected flights</h2>
      <LegResults :legs="store.legs" />
    </section>

    <section v-if="store.flightDetail" class="view-section">
      <FlightDetailResult :detail="store.flightDetail" />
    </section>
  </div>
</template>

<style scoped>
.view-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1.1rem 1.4rem;
  margin-top: 1.25rem;
}
.view-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-dark);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}
.view-section {
  margin-top: 1.75rem;
}
.view-section h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
</style>

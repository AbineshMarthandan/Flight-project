<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import MultiCitySearchForm from '@/components/MultiCitySearchForm.vue'
import SearchSteps from '@/components/SearchSteps.vue'
import LegResults from '@/components/LegResults.vue'
import FlightDetailResult from '@/components/FlightDetailResult.vue'
import FlightPicker from '@/components/FlightPicker.vue'

const store = useMultiCitySearchStore()
</script>

<template>
  <div>
    <div class="search-layout">
      <div class="search-layout__form">
        <MultiCitySearchForm />
      </div>

      <div class="search-layout__results">
        <section v-if="store.status !== 'idle'" class="view-panel">
          <SearchSteps :steps="store.steps" />
        </section>

        <p v-if="store.status === 'error'" class="view-error">{{ store.error }}</p>

        <p v-if="store.status === 'idle'" class="search-layout__empty">
          Set up your routes and run a search — results will appear here.
        </p>
      </div>
    </div>

    <section v-if="store.status === 'awaiting-selection'" class="search-layout__picker">
      <FlightPicker :candidates="store.candidates" :segment="store.currentSegment" @select="store.selectFlight" />
    </section>

    <section v-if="store.legs.length" class="search-layout__legs">
      <h2>Selected flights</h2>
      <LegResults :legs="store.legs" />
    </section>

    <section v-if="store.flightDetail" class="search-layout__detail">
      <div class="search-layout__detail-bar">
        <p class="search-layout__detail-hint">All legs selected — review the flight detail below, then continue to your cart.</p>
        <RouterLink to="/cart" class="search-layout__cart-btn">Go to cart</RouterLink>
      </div>
      <FlightDetailResult :detail="store.flightDetail" />
    </section>
  </div>
</template>

<style scoped>
.search-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: start;
  gap: 1.5rem;
}
.search-layout__form {
  min-width: 0;
  position: sticky;
  top: 1.75rem;
}
.search-layout__results {
  min-width: 0;
}
.search-layout__empty {
  margin: 0;
  padding: 2rem 1.4rem;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-xl);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: center;
}
.search-layout__picker {
  margin-top: 1.5rem;
}
.search-layout__legs {
  margin-top: 1.5rem;
}
.search-layout__legs h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.search-layout__detail {
  margin-top: 1.5rem;
}
.search-layout__detail-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
}
.search-layout__detail-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.search-layout__cart-btn {
  flex-shrink: 0;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--color-accent);
  color: #fff;
  text-decoration: none;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.search-layout__cart-btn:hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
@media (max-width: 900px) {
  .search-layout {
    grid-template-columns: 1fr;
  }
  .search-layout__form {
    position: static;
  }
}

.view-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1.1rem 1.4rem;
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
.view-section:first-child {
  margin-top: 0;
}
.view-section h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
</style>

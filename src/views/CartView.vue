<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import LegResults from '@/components/LegResults.vue'
import CartPanel from '@/components/CartPanel.vue'

const store = useMultiCitySearchStore()
</script>

<template>
  <div>
    <p v-if="!store.legs.length" class="view-empty">
      No flights selected yet — run a search on the <RouterLink to="/">Search</RouterLink> tab first.
    </p>

    <template v-else>
      <section class="view-section">
        <h2>Selected flights</h2>
        <LegResults :legs="store.legs" />
      </section>

      <section class="view-section">
        <CartPanel />
      </section>
    </template>
  </div>
</template>

<style scoped>
.view-empty {
  padding: 1.1rem 1.4rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.view-empty a {
  color: var(--color-accent);
  font-weight: 600;
}
.view-section {
  margin-top: 1.75rem;
}
.view-section:first-of-type {
  margin-top: 0;
}
.view-section h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
</style>

<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import FlightDetailResult from '@/components/FlightDetailResult.vue'

const store = useMultiCitySearchStore()
</script>

<template>
  <div>
    <p v-if="!store.cartId" class="view-empty">
      No cart yet — add a flight to your cart on the <RouterLink to="/cart">Cart</RouterLink> tab first.
    </p>

    <template v-else>
      <div class="baggage-bar">
        <p class="baggage-bar__cart">
          Cart ID: <strong>{{ store.cartId }}</strong>
        </p>
        <button type="button" class="baggage-bar__btn" :disabled="store.baggageLoading" @click="store.fetchBaggage()">
          {{ store.baggageLoading ? 'Loading…' : 'Fetch baggage options' }}
        </button>
      </div>

      <p v-if="store.baggageError" class="view-error">{{ store.baggageError }}</p>

      <section v-if="store.baggageResponse" class="view-section">
        <FlightDetailResult :detail="store.baggageResponse" title="Baggage selection response" />
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
  margin-top: 1.5rem;
}
.baggage-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1rem 1.25rem;
}
.baggage-bar__cart {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.baggage-bar__btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--color-accent);
  color: #fff;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.baggage-bar__btn:not(:disabled):hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
.baggage-bar__btn:disabled {
  background: var(--color-accent-disabled);
  cursor: not-allowed;
}
</style>

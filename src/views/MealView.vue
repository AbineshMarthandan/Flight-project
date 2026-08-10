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
      <div class="meal-bar">
        <p class="meal-bar__cart">
          Cart ID: <strong>{{ store.cartId }}</strong>
        </p>
        <button type="button" class="meal-bar__btn" :disabled="store.mealLoading" @click="store.fetchMeals()">
          {{ store.mealLoading ? 'Loading…' : 'Fetch meal options' }}
        </button>
      </div>

      <p v-if="store.mealError" class="view-error">{{ store.mealError }}</p>

      <section v-if="store.mealResponse" class="view-section">
        <FlightDetailResult :detail="store.mealResponse" title="Meal selection response" />
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
.meal-bar {
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
.meal-bar__cart {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.meal-bar__btn {
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
.meal-bar__btn:not(:disabled):hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
.meal-bar__btn:disabled {
  background: var(--color-accent-disabled);
  cursor: not-allowed;
}
</style>

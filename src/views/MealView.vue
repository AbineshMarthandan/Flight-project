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
        <div v-if="store.mealSegments.length" class="meal-picker">
          <p class="meal-picker__hint">
            Selections are appended to <code>meals</code> on the matching passenger in both booking payloads below.
          </p>

          <div v-for="segment in store.mealSegments" :key="segment.flightId" class="meal-segment">
            <div class="meal-segment__header">
              <span class="meal-segment__route">{{ segment.origin }} → {{ segment.destination }}</span>
              <span class="meal-segment__meta">
                {{ segment.airline?.displayName }} · {{ segment.departureDate }} {{ segment.departureTime }}
              </span>
            </div>

            <p v-if="!segment.paxSlots.length" class="meal-segment__empty">
              No eligible passengers for this segment's meal options.
            </p>

            <div v-else class="meal-segment__slots">
              <div v-for="slot in segment.paxSlots" :key="`${slot.paxKey}-${slot.paxIndex}`" class="meal-slot">
                <label class="meal-slot__label">{{ slot.label }}</label>
                <select
                  class="meal-slot__select"
                  :value="store.getMealSelectionCode(slot.paxKey, slot.paxIndex, segment.flightId)"
                  @change="store.setMealSelection(slot.paxKey, slot.paxIndex, segment, $event.target.value)"
                >
                  <option value="">No meal</option>
                  <option v-for="option in segment.inputSources" :key="option.value" :value="option.value">
                    {{ option.label }} — {{ option.currency }} {{ option.price }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <p v-if="store.mealSelectionWarning" class="view-error">{{ store.mealSelectionWarning }}</p>
        </div>
        <p v-else class="view-empty">No meal options available for this itinerary.</p>
      </section>

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
.meal-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.meal-picker__hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.meal-picker__hint code {
  font-family: var(--font-mono);
  font-size: 0.8em;
}
.meal-segment {
  padding: 1rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}
.meal-segment__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.meal-segment__route {
  font-weight: 700;
  font-size: 0.95rem;
}
.meal-segment__meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.meal-segment__empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.meal-segment__slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.meal-slot {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.meal-slot__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-body);
}
.meal-slot__select {
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-input-border);
  background: var(--color-surface);
  font-size: 0.85rem;
  color: var(--color-text-body);
}
.meal-slot__select:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>

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
      <div class="seat-bar">
        <p class="seat-bar__cart">
          Cart ID: <strong>{{ store.cartId }}</strong>
        </p>
        <button type="button" class="seat-bar__btn" :disabled="store.seatLoading" @click="store.fetchSeats()">
          {{ store.seatLoading ? 'Loading…' : 'Fetch seat options' }}
        </button>
      </div>

      <p v-if="store.seatError" class="view-error">{{ store.seatError }}</p>

      <section v-if="store.seatResponse" class="view-section">
        <div v-if="store.seatSegments.length" class="seat-picker">
          <p class="seat-picker__hint">
            Selections are appended to <code>seats</code> on the matching passenger in both booking payloads below.
            Only bookable seats are listed; picking the same seat for more than one passenger is not blocked here.
          </p>

          <div v-for="segment in store.seatSegments" :key="segment.key" class="seat-segment">
            <div class="seat-segment__header">
              <span class="seat-segment__route">{{ segment.origin }} → {{ segment.destination }}</span>
              <span class="seat-segment__meta">
                {{ segment.airline }} {{ segment.flightNumber }} · {{ segment.departureDate }} {{ segment.departureTime }}
              </span>
            </div>

            <p v-if="!segment.paxSlots.length" class="seat-segment__empty">
              No eligible passengers for this segment's seat map.
            </p>

            <div v-else class="seat-segment__slots">
              <div v-for="slot in segment.paxSlots" :key="`${slot.paxKey}-${slot.paxIndex}`" class="seat-slot">
                <label class="seat-slot__label">{{ slot.label }}</label>
                <select
                  class="seat-slot__select"
                  :value="store.getSeatSelectionCode(slot.paxKey, slot.paxIndex, segment.key)"
                  @change="store.setSeatSelection(slot.paxKey, slot.paxIndex, segment, $event.target.value)"
                >
                  <option value="">No seat</option>
                  <option v-for="option in segment.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <p v-if="store.seatSelectionWarning" class="view-error">{{ store.seatSelectionWarning }}</p>
        </div>
        <p v-else class="view-empty">No seat options available for this itinerary.</p>
      </section>

      <section v-if="store.seatResponse" class="view-section">
        <FlightDetailResult :detail="store.seatResponse" title="Seat selection response" />
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
.seat-bar {
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
.seat-bar__cart {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.seat-bar__btn {
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
.seat-bar__btn:not(:disabled):hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
.seat-bar__btn:disabled {
  background: var(--color-accent-disabled);
  cursor: not-allowed;
}
.seat-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.seat-picker__hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
.seat-picker__hint code {
  font-family: var(--font-mono);
  font-size: 0.8em;
}
.seat-segment {
  padding: 1rem 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}
.seat-segment__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.seat-segment__route {
  font-weight: 700;
  font-size: 0.95rem;
}
.seat-segment__meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.seat-segment__empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.seat-segment__slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.seat-slot {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.seat-slot__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-body);
}
.seat-slot__select {
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-input-border);
  background: var(--color-surface);
  font-size: 0.85rem;
  color: var(--color-text-body);
}
.seat-slot__select:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>

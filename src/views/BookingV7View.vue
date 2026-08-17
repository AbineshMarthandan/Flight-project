<script setup>
import { onMounted } from 'vue'
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import FlightDetailResult from '@/components/FlightDetailResult.vue'
import BookingTraceResult from '@/components/BookingTraceResult.vue'

const store = useMultiCitySearchStore()

onMounted(() => {
  store.syncCartIdIntoBookingPayloads()
})
</script>

<template>
  <div>
    <section v-if="store.cartResponse" class="view-section">
      <FlightDetailResult :detail="store.cartResponse" title="Add to cart response" />
    </section>

    <section class="view-section">
      <div class="booking-bar">
        <p class="booking-bar__hint">Paste the v7 booking payload, then click Book.</p>
        <div class="booking-bar__actions">
          <button type="button" class="booking-bar__btn booking-bar__btn--ghost" @click="store.fillBookingV7Passengers()">
            Fill passengers ({{ store.adult }}A / {{ store.child }}C / {{ store.infant }}I)
          </button>
          <button type="button" class="booking-bar__btn" :disabled="store.bookingV7Loading" @click="store.submitBookingV7()">
            {{ store.bookingV7Loading ? 'Booking…' : 'Book' }}
          </button>
        </div>
      </div>
      <textarea
        v-model="store.bookingV7PayloadText"
        class="booking-textarea"
        rows="16"
        spellcheck="false"
        placeholder="Paste the v7 booking payload JSON here"
      ></textarea>
    </section>

    <p v-if="store.bookingV7Error" class="view-error">{{ store.bookingV7Error }}</p>

    <section v-if="store.bookingV7Request" class="view-section">
      <FlightDetailResult :detail="store.bookingV7Request" title="Booking v7 request" />
    </section>
    <section v-if="store.bookingV7Response" class="view-section">
      <FlightDetailResult :detail="store.bookingV7Response" title="Booking v7 response" />
    </section>

    <section v-if="store.bookingV7RequestId" class="view-section">
      <div class="booking-bar">
        <p class="booking-bar__hint">
          Request ID: <strong>{{ store.bookingV7RequestId }}</strong>
        </p>
        <button
          type="button"
          class="booking-bar__btn"
          :disabled="store.bookingV7TraceLoading"
          @click="store.fetchBookingV7Trace()"
        >
          {{ store.bookingV7TraceLoading ? 'Fetching…' : 'Fetch internal API trace' }}
        </button>
      </div>
      <p v-if="store.bookingV7TraceError" class="view-error">{{ store.bookingV7TraceError }}</p>
      <BookingTraceResult v-if="store.bookingV7Trace" :trace="store.bookingV7Trace" />
    </section>
  </div>
</template>

<style scoped>
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
.view-section:first-of-type {
  margin-top: 0;
}
.booking-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow: var(--shadow-sm);
  padding: 1rem 1.25rem;
}
.booking-bar__hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.booking-bar__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}
.booking-bar__btn {
  flex-shrink: 0;
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
.booking-bar__btn:not(:disabled):hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
.booking-bar__btn--ghost {
  background: var(--color-surface);
  border-color: var(--color-input-border);
  color: var(--color-text-body);
}
.booking-bar__btn--ghost:not(:disabled):hover {
  background: var(--color-surface);
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: none;
  transform: none;
}
.booking-bar__btn:disabled {
  background: var(--color-accent-disabled);
  cursor: not-allowed;
}
.booking-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--color-text-body);
  resize: vertical;
}
.booking-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>

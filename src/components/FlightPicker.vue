<script setup>
import { computed } from 'vue'
import { formatTime, formatPrice } from '@/utils/format'
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'

const props = defineProps({
  candidates: { type: Array, required: true },
  segment: { type: Number, required: true },
})
const emit = defineEmits(['select'])

const store = useMultiCitySearchStore()

const sorted = computed(() =>
  [...props.candidates].sort((a, b) => (a.trackerProperties?.price ?? 0) - (b.trackerProperties?.price ?? 0)),
)

function airlines(flight) {
  return flight.filterProperties?.values?.airlines?.join(', ') || '—'
}

function supplierName(flight) {
  return store.supplierNames[flight.supplierId] || flight.supplierId || '—'
}
</script>

<template>
  <div class="picker">
    <div class="picker__header">
      <h2>Choose a flight — Leg {{ segment }}</h2>
      <span class="picker__count">{{ candidates.length }} option{{ candidates.length === 1 ? '' : 's' }}</span>
    </div>

    <div class="picker__list">
      <div v-for="flight in sorted" :key="flight.flightId" class="picker__card">
        <div class="picker__times">
          <strong>{{ formatTime(flight.card?.departure?.time) }}</strong>
          <span class="picker__arrow">&rarr;</span>
          <strong>{{ formatTime(flight.card?.arrival?.time) }}</strong>
          <span class="picker__route">{{ flight.card?.departure?.airportCode }} &rarr; {{ flight.card?.arrival?.airportCode }}</span>
        </div>
        <div class="picker__meta">
          <span>{{ airlines(flight) }}</span>
          <span class="picker__supplier" :title="flight.supplierId">{{ supplierName(flight) }}</span>
          <span v-if="flight.comboMC" class="picker__badge">Combo MC</span>
        </div>
        <div class="picker__price">{{ formatPrice(flight.trackerProperties?.price) }}</div>
        <button type="button" class="picker__select" @click="emit('select', flight)">Select</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.picker {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1.1rem 1.25rem;
}
.picker__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}
.picker__header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}
.picker__count {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
.picker__list {
  max-height: 28rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-right: 0.25rem;
}
.picker__card {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 0.75rem 1rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.picker__card:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-sm);
}
.picker__times {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.88rem;
  min-width: 0;
}
.picker__arrow {
  color: var(--color-text-subtle);
}
.picker__route {
  color: var(--color-text-muted);
  font-size: 0.78rem;
}
.picker__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-body);
  white-space: nowrap;
}
.picker__supplier {
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  cursor: help;
}
.picker__badge {
  font-size: 0.68rem;
  color: var(--color-accent);
  background: var(--color-accent-soft);
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}
.picker__price {
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
}
.picker__select {
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}
.picker__select:hover {
  background: var(--color-accent-hover);
}
</style>

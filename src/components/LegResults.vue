<script setup>
defineProps({
  legs: { type: Array, required: true },
})

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function formatPrice(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value,
  )
}
</script>

<template>
  <div class="legs">
    <div v-for="leg in legs" :key="leg.segment" class="leg-card">
      <div class="leg-card__route">
        <strong>{{ leg.route?.origin }} &rarr; {{ leg.route?.destination }}</strong>
        <span class="leg-card__badge">Leg {{ leg.segment }}</span>
      </div>
      <div class="leg-card__grid">
        <div><span class="leg-card__label">Departs</span>{{ formatTime(leg.departureTime) }}</div>
        <div><span class="leg-card__label">Arrives</span>{{ formatTime(leg.arrivalTime) }}</div>
        <div><span class="leg-card__label">Price</span>{{ formatPrice(leg.paxPrice) }}</div>
        <div>
          <span class="leg-card__label">Flight ID</span>
          <span class="leg-card__clamp" :title="leg.flightId">{{ leg.flightId }}</span>
        </div>
        <div>
          <span class="leg-card__label">Supplier</span>
          <span class="leg-card__clamp" :title="leg.supplierId">{{ leg.supplierId }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.leg-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}
.leg-card__route {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}
.leg-card__badge {
  font-size: 0.7rem;
  color: var(--color-accent);
  background: var(--color-accent-soft);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.leg-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.4rem 1rem;
  font-size: 0.85rem;
  color: var(--color-text-body);
}
.leg-card__grid > div {
  /* grid items default to min-width: auto, which lets an unbroken token
     (base64-ish ids) force the track wider than the card instead of wrapping */
  min-width: 0;
}
.leg-card__label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.leg-card__clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  cursor: help;
}
</style>

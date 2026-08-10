<script setup>
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'

const store = useMultiCitySearchStore()
</script>

<template>
  <div class="filters">
    <span class="filters__title">Flight pick filters</span>

    <label class="filters__option">
      <input v-model="store.filters.comboMC" type="checkbox" />
      Combo MC only
    </label>

    <label class="filters__option">
      <input v-model="store.filters.supplierEnabled" type="checkbox" />
      Supplier contains
    </label>
    <input
      v-model="store.filters.supplier"
      type="text"
      class="filters__input"
      placeholder="e.g. airasia"
      :disabled="!store.filters.supplierEnabled"
    />
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 1.1rem 0;
  padding: 0.85rem 1.1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.filters__title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.filters__option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-body);
  cursor: pointer;
}
.filters__input {
  flex: 1;
  min-width: 10rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: border-color 0.15s ease;
}
.filters__input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.filters__input:disabled {
  background: var(--color-border-soft);
  color: var(--color-text-subtle);
}
</style>

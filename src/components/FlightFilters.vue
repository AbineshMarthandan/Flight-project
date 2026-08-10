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
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.filters__title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.filters__option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #374151;
  cursor: pointer;
}
.filters__input {
  flex: 1;
  min-width: 10rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}
.filters__input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}
</style>

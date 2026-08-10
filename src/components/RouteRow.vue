<script setup>
defineProps({
  modelValue: { type: Object, required: true },
  index: { type: Number, required: true },
  removable: { type: Boolean, default: true },
})
defineEmits(['remove'])
</script>

<template>
  <div class="route-row">
    <span class="route-row__badge">{{ index + 1 }}</span>
    <input
      v-model="modelValue.origin"
      class="route-row__input"
      placeholder="Origin (e.g. CGK)"
      maxlength="3"
      @input="modelValue.origin = modelValue.origin.toUpperCase()"
    />
    <span class="route-row__arrow">&rarr;</span>
    <input
      v-model="modelValue.destination"
      class="route-row__input"
      placeholder="Destination (e.g. SIN)"
      maxlength="3"
      @input="modelValue.destination = modelValue.destination.toUpperCase()"
    />
    <input v-model="modelValue.departureDate" type="date" class="route-row__input route-row__input--date" />
    <button
      type="button"
      class="route-row__remove"
      :disabled="!removable"
      title="Remove leg"
      @click="$emit('remove')"
    >
      &times;
    </button>
  </div>
</template>

<style scoped>
.route-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.route-row__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #eef2ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.route-row__input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}
.route-row__input--date {
  flex: 1.2;
}
.route-row__arrow {
  color: #9ca3af;
  flex-shrink: 0;
}
.route-row__remove {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.route-row__remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.route-row__remove:not(:disabled):hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #b91c1c;
}
</style>

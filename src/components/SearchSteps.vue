<script setup>
defineProps({
  steps: { type: Array, required: true },
})
</script>

<template>
  <ol class="steps">
    <li v-for="step in steps" :key="step.key" class="steps__item" :class="`steps__item--${step.status}`">
      <span class="steps__icon">
        <template v-if="step.status === 'done'">&check;</template>
        <template v-else-if="step.status === 'error'">&times;</template>
        <template v-else-if="step.status === 'active'">&hellip;</template>
        <template v-else>&middot;</template>
      </span>
      <span class="steps__label">{{ step.label }}</span>
      <span v-if="step.error" class="steps__error">{{ step.error }}</span>
    </li>
  </ol>
</template>

<style scoped>
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.steps__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: var(--color-text-subtle);
  transition: color 0.15s ease;
}
.steps__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--color-border-soft);
  font-size: 0.75rem;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.steps__item--active {
  color: var(--color-accent);
  font-weight: 600;
}
.steps__item--active .steps__icon {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
.steps__item--done {
  color: var(--color-success);
}
.steps__item--done .steps__icon {
  background: #dcfce7;
  color: var(--color-success);
}
.steps__item--error {
  color: var(--color-danger);
  font-weight: 600;
}
.steps__item--error .steps__icon {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.steps__error {
  color: var(--color-danger);
  font-weight: 400;
  font-size: 0.75rem;
}
</style>

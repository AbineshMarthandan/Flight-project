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
  color: #9ca3af;
}
.steps__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: #f3f4f6;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.steps__item--active {
  color: #4338ca;
  font-weight: 600;
}
.steps__item--active .steps__icon {
  background: #eef2ff;
  color: #4338ca;
}
.steps__item--done {
  color: #16a34a;
}
.steps__item--done .steps__icon {
  background: #dcfce7;
  color: #16a34a;
}
.steps__item--error {
  color: #dc2626;
  font-weight: 600;
}
.steps__item--error .steps__icon {
  background: #fee2e2;
  color: #dc2626;
}
.steps__error {
  color: #dc2626;
  font-weight: 400;
  font-size: 0.75rem;
}
</style>

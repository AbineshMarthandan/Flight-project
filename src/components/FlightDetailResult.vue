<script setup>
defineProps({
  detail: { type: Object, required: true },
  title: { type: String, default: 'Flight detail' },
})
</script>

<template>
  <div class="detail">
    <h3 class="detail__title">{{ title }}</h3>
    <pre class="detail__json">{{ JSON.stringify(detail, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.detail {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  background: #0b1021;
  box-shadow: var(--shadow-sm);
}
.detail__title {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #e5e7eb;
}
.detail__json {
  margin: 0;
  max-height: 24rem;
  overflow: auto;
  font-size: 0.78rem;
  line-height: 1.4;
  color: #a5f3fc;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

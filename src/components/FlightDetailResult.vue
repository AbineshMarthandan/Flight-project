<script setup>
defineProps({
  detail: { type: Object, required: true },
})
</script>

<template>
  <div class="detail">
    <h3 class="detail__title">Flight detail</h3>
    <pre class="detail__json">{{ JSON.stringify(detail, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.detail {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  background: #0b1021;
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

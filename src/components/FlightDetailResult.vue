<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  detail: { type: Object, required: true },
  title: { type: String, default: 'Flight detail' },
})

const copied = ref(false)
const json = computed(() => JSON.stringify(props.detail, null, 2))

async function copyJson() {
  await navigator.clipboard.writeText(json.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="detail">
    <div class="detail__header">
      <h3 class="detail__title">{{ title }}</h3>
      <button type="button" class="detail__copy" :title="copied ? 'Copied!' : 'Copy JSON'" @click="copyJson">
        <template v-if="copied">&check;</template>
        <template v-else>&#128203;</template>
      </button>
    </div>
    <pre class="detail__json">{{ json }}</pre>
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
.detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.detail__title {
  margin: 0;
  font-size: 0.9rem;
  color: #e5e7eb;
}
.detail__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid rgba(229, 231, 235, 0.25);
  border-radius: var(--radius-sm);
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.15s ease;
}
.detail__copy:hover {
  background: rgba(229, 231, 235, 0.12);
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

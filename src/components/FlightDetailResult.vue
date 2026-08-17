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
        <svg
          v-if="copied"
          class="detail__copy-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg
          v-else
          class="detail__copy-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
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
  background: var(--color-code-bg);
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
  color: var(--color-code-text);
}
.detail__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid var(--color-code-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-code-text);
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s ease;
}
.detail__copy-icon {
  width: 0.8rem;
  height: 0.8rem;
}
.detail__copy:hover {
  background: var(--color-code-hover);
}
.detail__json {
  margin: 0;
  max-height: 24rem;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--color-code-accent);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

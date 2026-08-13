<script setup>
import { onMounted } from 'vue'
import { useEnvSettingsStore } from '@/stores/envSettings'

const store = useEnvSettingsStore()

onMounted(() => {
  store.fetchConfig()
})

function envLabel(envKey) {
  return envKey === 'local' ? 'Local' : 'K8s'
}
</script>

<template>
  <div>
    <section class="view-section">
      <h2>Environment settings</h2>
      <p class="settings__hint">
        Switch each backend service between its local and k8s target. Changes take effect immediately on the next
        request — no dev server restart needed.
      </p>

      <p v-if="store.error" class="settings__error">{{ store.error }}</p>

      <div class="settings-card">
        <div v-for="(svc, key) in store.services" :key="key" class="settings-row">
          <div class="settings-row__info">
            <span class="settings-row__label">{{ svc.label }}</span>
            <span class="settings-row__target">{{ svc.envs[store.current[key]] }}</span>
          </div>
          <select
            class="settings-row__select"
            :value="store.current[key]"
            @change="store.setEnv(key, $event.target.value)"
          >
            <option v-for="envKey in Object.keys(svc.envs)" :key="envKey" :value="envKey">
              {{ envLabel(envKey) }}
            </option>
          </select>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.view-section h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.settings__hint {
  margin: 0 0 1.1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.settings__error {
  margin: 0 0 1rem;
  padding: 0.6rem 0.9rem;
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-dark);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.settings-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 0.5rem 1.5rem;
}
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
}
.settings-row + .settings-row {
  border-top: 1px solid var(--color-border-soft);
}
.settings-row__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}
.settings-row__label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}
.settings-row__target {
  font-size: 0.78rem;
  color: var(--color-text-subtle);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.settings-row__select {
  flex-shrink: 0;
  width: 7rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  background: var(--color-surface);
  color: var(--color-text-body);
  transition: border-color 0.15s ease;
}
.settings-row__select:focus {
  outline: none;
  border-color: var(--color-accent);
}
</style>

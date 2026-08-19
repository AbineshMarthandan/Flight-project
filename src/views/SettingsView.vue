<script setup>
import { onMounted, ref } from 'vue'
import { useEnvSettingsStore } from '@/stores/envSettings'
import { publishCartCreated } from '@/api/flightCart'

const store = useEnvSettingsStore()

onMounted(() => {
  store.fetchConfig()
})

function envLabel(envKey) {
  return envKey === 'local' ? 'Local' : 'K8s'
}

// ── Publish cartCreated ──────────────────────────────────────────────────────
const publishCartId = ref('')
const publishState = ref('idle') // idle | loading | success | error
const publishSteps = ref([])
const publishError = ref('')

async function handlePublishCart() {
  const cartId = publishCartId.value.trim()
  if (!cartId) return

  publishState.value = 'loading'
  publishSteps.value = []
  publishError.value = ''

  try {
    const result = await publishCartCreated(cartId)
    publishSteps.value = result.steps ?? []
    publishState.value = 'success'
  } catch (err) {
    publishError.value = err.body?.error || err.message || 'Unknown error'
    publishSteps.value = err.body?.steps ?? []
    publishState.value = 'error'
  }
}

function stepIcon(status) {
  return status === 'ok' ? '✓' : '✗'
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

    <section class="view-section">
      <h2>Publish cartCreated</h2>
      <p class="settings__hint">
        Fetches the cart from local MongoDB, publishes it to
        <code>com.tiket.tix.flight.cart.cartCreated</code> (Kafka), and writes the
        Snappy-compressed payload to Redis under
        <code>com.tiket.tix.flight.cart.createdCart-&lt;id&gt;-zip</code>.
      </p>

      <div class="publish-card">
        <div class="publish-row">
          <input
            v-model="publishCartId"
            class="publish-input"
            type="text"
            placeholder="Paste cart ID (e.g. 6a82c33eeedd10a56f0a4c1e)"
            :disabled="publishState === 'loading'"
            @keydown.enter="handlePublishCart"
          />
          <button
            class="publish-btn"
            :disabled="!publishCartId.trim() || publishState === 'loading'"
            @click="handlePublishCart"
          >
            <span v-if="publishState === 'loading'" class="publish-btn__spinner" />
            <span v-else>Publish</span>
          </button>
        </div>

        <div v-if="publishSteps.length" class="publish-steps">
          <div
            v-for="step in publishSteps"
            :key="step.step"
            class="publish-step"
            :class="step.status === 'ok' ? 'publish-step--ok' : 'publish-step--err'"
          >
            <span class="publish-step__icon">{{ stepIcon(step.status) }}</span>
            <span class="publish-step__name">{{ step.step }}</span>
            <span class="publish-step__detail">
              <template v-if="step.step === 'mongo'">cart found</template>
              <template v-else-if="step.step === 'kafka'">
                {{ step.status === 'ok' ? step.key : step.error }}
              </template>
              <template v-else-if="step.step === 'redis'">
                {{ step.status === 'ok' ? `${step.key} (TTL ${step.ttl}s)` : step.error }}
              </template>
              <template v-else>{{ step.error }}</template>
            </span>
          </div>
        </div>

        <p v-if="publishState === 'error' && publishError" class="publish-error">
          {{ publishError }}
        </p>
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

/* ── Publish cart ── */
.publish-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.publish-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.publish-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-family: monospace;
  background: var(--color-surface);
  color: var(--color-text-body);
  transition: border-color 0.15s ease;
}
.publish-input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.publish-input:disabled {
  opacity: 0.5;
}
.publish-btn {
  flex-shrink: 0;
  padding: 0.5rem 1.1rem;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5rem;
  transition: opacity 0.15s ease;
}
.publish-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.publish-btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.publish-steps {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.publish-step {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.82rem;
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-sm);
}
.publish-step--ok {
  background: var(--color-success-soft, #f0fdf4);
  color: var(--color-success-dark, #166534);
}
.publish-step--err {
  background: var(--color-danger-soft, #fef2f2);
  color: var(--color-danger-dark, #991b1b);
}
.publish-step__icon {
  font-weight: 700;
  width: 1rem;
  flex-shrink: 0;
}
.publish-step__name {
  font-weight: 600;
  width: 4rem;
  flex-shrink: 0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}
.publish-step__detail {
  font-family: monospace;
  font-size: 0.78rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.publish-error {
  margin: 0;
  padding: 0.6rem 0.9rem;
  background: var(--color-danger-soft, #fef2f2);
  border: 1px solid var(--color-danger-border, #fecaca);
  color: var(--color-danger-dark, #991b1b);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}
</style>

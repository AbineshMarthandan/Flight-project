import { defineStore } from 'pinia'

const ENV_CONFIG_PATH = '/__env-config'

export const useEnvSettingsStore = defineStore('envSettings', {
  state: () => ({
    services: {},
    current: {},
    loading: false,
    error: null,
  }),
  actions: {
    async fetchConfig() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(ENV_CONFIG_PATH)
        const data = await res.json()
        this.services = data.services
        this.current = data.current
      } catch (err) {
        this.error = err.message || 'Failed to load environment config'
      } finally {
        this.loading = false
      }
    },
    async setEnv(service, env) {
      this.error = null
      try {
        const res = await fetch(ENV_CONFIG_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service, env }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to switch environment')
        }
        this.current = data.current
      } catch (err) {
        this.error = err.message || 'Failed to switch environment'
      }
    },
  },
})

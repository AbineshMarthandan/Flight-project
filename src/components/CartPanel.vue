<script setup>
import { ref } from 'vue'
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'
import FlightDetailResult from './FlightDetailResult.vue'

const store = useMultiCitySearchStore()
const copied = ref(false)

async function copyCartId() {
  await navigator.clipboard.writeText(store.cartId)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="cart">
    <div class="cart__actions">
      <label class="cart__currency">
        <span class="cart__currency-label">Currency</span>
        <input v-model="store.cartCurrency" type="text" class="cart__currency-input" placeholder="IDR" maxlength="3" />
      </label>
      <button type="button" class="cart__btn" :disabled="store.addingToCart" @click="store.addToCart()">
        {{ store.addingToCart ? 'Adding to cart…' : 'Add to cart' }}
      </button>
    </div>

    <p v-if="store.cartId" class="cart__success">
      Added to cart — Cart ID: <strong>{{ store.cartId }}</strong>
      <button type="button" class="cart__copy" :title="copied ? 'Copied!' : 'Copy cart ID'" @click="copyCartId">
        <svg
          v-if="copied"
          class="cart__copy-icon"
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
          class="cart__copy-icon"
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
    </p>
    <p v-if="store.cartError" class="cart__error">{{ store.cartError }}</p>

    <FlightDetailResult v-if="store.cartResponse" class="cart__response" :detail="store.cartResponse" title="Add to cart response" />

    <div v-if="store.cartId" class="cart__get">
      <button type="button" class="cart__get-btn" :disabled="store.cartFetchLoading" @click="store.fetchCart()">
        {{ store.cartFetchLoading ? 'Loading…' : 'Get cart' }}
      </button>

      <p v-if="store.cartFetchError" class="cart__error">{{ store.cartFetchError }}</p>

      <FlightDetailResult
        v-if="store.cartFetchResponse"
        class="cart__response"
        :detail="store.cartFetchResponse"
        title="Get cart response"
      />
    </div>
  </div>
</template>

<style scoped>
.cart {
  margin-top: 0.5rem;
}
.cart__actions {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}
.cart__currency {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.cart__currency-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
.cart__currency-input {
  width: 5rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--color-text-body);
  background: var(--color-surface);
}
.cart__currency-input:focus {
  outline: none;
  border-color: var(--color-accent);
}
.cart__btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--color-success);
  color: #fff;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.cart__btn:not(:disabled):hover {
  background: var(--color-success-hover);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.28);
  transform: translateY(-1px);
}
.cart__btn:disabled {
  background: var(--color-success-disabled);
  cursor: not-allowed;
}
.cart__success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
  padding: 0.6rem 0.9rem;
  background: var(--color-success-soft);
  border: 1px solid var(--color-success-border);
  color: var(--color-success-dark);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}
.cart__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-success-dark);
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  transition: background 0.15s ease;
}
.cart__copy-icon {
  width: 0.8rem;
  height: 0.8rem;
}
.cart__copy:hover {
  background: var(--color-success-emphasis-soft);
}
.cart__error {
  margin-top: 0.6rem;
  padding: 0.6rem 0.9rem;
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-border);
  color: var(--color-danger-dark);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}
.cart__response {
  margin-top: 0.75rem;
}
.cart__get {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-soft);
}
.cart__get-btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  background: var(--color-accent);
  color: #fff;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}
.cart__get-btn:not(:disabled):hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 16px rgba(67, 56, 202, 0.28);
  transform: translateY(-1px);
}
.cart__get-btn:disabled {
  background: var(--color-accent-disabled);
  cursor: not-allowed;
}
</style>

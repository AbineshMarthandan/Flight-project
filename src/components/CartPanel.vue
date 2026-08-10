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
    <button type="button" class="cart__btn" :disabled="store.addingToCart" @click="store.addToCart()">
      {{ store.addingToCart ? 'Adding to cart…' : 'Add to cart' }}
    </button>

    <p v-if="store.cartId" class="cart__success">
      Added to cart — Cart ID: <strong>{{ store.cartId }}</strong>
      <button type="button" class="cart__copy" :title="copied ? 'Copied!' : 'Copy cart ID'" @click="copyCartId">
        <template v-if="copied">&check;</template>
        <template v-else>&#128203;</template>
      </button>
    </p>
    <p v-if="store.cartError" class="cart__error">{{ store.cartError }}</p>

    <FlightDetailResult v-if="store.cartResponse" class="cart__response" :detail="store.cartResponse" title="Add to cart response" />
  </div>
</template>

<style scoped>
.cart {
  margin-top: 0.5rem;
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
  background: #128a3e;
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.28);
  transform: translateY(-1px);
}
.cart__btn:disabled {
  background: #86efac;
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
.cart__copy:hover {
  background: #dcfce7;
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
</style>

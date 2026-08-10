<script setup>
import { ref } from 'vue'
import { useMultiCitySearchStore } from '@/stores/multiCitySearch'

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
  </div>
</template>

<style scoped>
.cart {
  margin-top: 0.5rem;
}
.cart__btn {
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  background: #16a34a;
  color: #fff;
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
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  border-radius: 8px;
  font-size: 0.85rem;
}
.cart__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  padding: 0;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: #fff;
  color: #166534;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
}
.cart__copy:hover {
  background: #dcfce7;
}
.cart__error {
  margin-top: 0.6rem;
  padding: 0.6rem 0.9rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 0.85rem;
}
</style>

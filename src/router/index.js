import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '@/views/SearchView.vue'
import CartView from '@/views/CartView.vue'
import BaggageView from '@/views/BaggageView.vue'
import MealView from '@/views/MealView.vue'
import SeatView from '@/views/SeatView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'search', component: SearchView, meta: { title: 'Search flights' } },
    { path: '/cart', name: 'cart', component: CartView, meta: { title: 'Cart' } },
    { path: '/ancillary/baggage', name: 'ancillary-baggage', component: BaggageView, meta: { title: 'Baggage V2' } },
    { path: '/ancillary/meal', name: 'ancillary-meal', component: MealView, meta: { title: 'Meal V2' } },
    { path: '/ancillary/seat', name: 'ancillary-seat', component: SeatView, meta: { title: 'Seat V2' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { title: 'Settings' } },
  ],
})

export default router

<script setup>
import { useRoute } from 'vue-router'
import SideNav from '@/components/SideNav.vue'

const route = useRoute()
</script>

<template>
  <div class="shell">
    <SideNav />

    <div class="shell__main">
      <header class="shell__topbar">
        <h1>{{ route.meta.title }}</h1>
      </header>

      <div class="shell__content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  width: 100%;
}
.shell__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.shell__topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1.35rem 2.5rem;
}
.shell__topbar h1 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.shell__content {
  flex: 1;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.75rem 2.5rem 4rem;
}
</style>

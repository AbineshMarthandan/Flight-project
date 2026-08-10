<script setup></script>

<template>
  <aside class="side-nav">
    <div class="side-nav__brand">
      <span class="side-nav__mark">&#9992;</span>
      <div>
        <p class="side-nav__title">Flight</p>
        <p class="side-nav__subtitle">Multi-city search</p>
      </div>
    </div>

    <nav class="side-nav__nav">
      <RouterLink to="/" class="side-nav__link" active-class="side-nav__link--active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search
      </RouterLink>
      <RouterLink to="/cart" class="side-nav__link" active-class="side-nav__link--active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        Cart
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.side-nav {
  width: var(--sidebar-width);
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.75rem 1.1rem;
  background: linear-gradient(180deg, var(--sidebar-bg-from), var(--sidebar-bg-to));
  color: var(--sidebar-text);
}

.side-nav__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.4rem;
}
.side-nav__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-lg);
  background: var(--color-accent);
  color: #fff;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.side-nav__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}
.side-nav__subtitle {
  margin: 0;
  font-size: 0.72rem;
  color: var(--sidebar-text);
  line-height: 1.3;
}

.side-nav__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.side-nav__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.side-nav__link svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.side-nav__link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.side-nav__link--active {
  background: var(--color-accent);
  color: #fff;
  box-shadow: var(--shadow-sm);
}
</style>

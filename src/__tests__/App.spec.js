import { describe, it, expect, beforeEach } from 'vitest'

import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mounts renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Multi-city flight search')
  })
})

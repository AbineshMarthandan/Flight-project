<script setup>
import { computed } from 'vue'
import FlightDetailResult from './FlightDetailResult.vue'
import { parseJavaLikeObject } from '@/utils/javaToString'

const props = defineProps({
  trace: { type: Object, required: true },
})

function shortLogger(logger) {
  if (!logger) return '—'
  const parts = logger.split('.')
  return parts[parts.length - 1]
}

function isHttpLogger(call) {
  return call.logger?.endsWith('HttpLoggingCategory')
}

function isRequestMarker(call) {
  return isHttpLogger(call) && (call.message ?? '').trim().startsWith('requestId:')
}

// The backend only logs a bare "requestId: X" marker for the outbound side of
// an internal call and the full JSON for the inbound side — there's no logged
// request body to pair it with. The `name` tag on HttpLoggingCategory lines is
// inconsistently generic ("HTTP outbound"), so we track the last meaningful
// module name seen from ordinary business-log lines and fall back to that.
const apiCalls = computed(() => {
  const calls = props.trace?.calls ?? []
  const found = []
  let lastKnownName = null

  calls.forEach((call, i) => {
    if (call.name && call.name !== 'HTTP outbound') lastKnownName = call.name
    if (!isRequestMarker(call)) return

    const next = calls[i + 1]
    if (!next || !isHttpLogger(next) || isRequestMarker(next)) return

    let response = next.message
    try {
      response = JSON.parse(next.message)
    } catch {
      // Not JSON — show the raw string as-is.
    }

    const apiName = next.name && next.name !== 'HTTP outbound' ? next.name : lastKnownName || 'Internal call'

    // The wire-level request body is never logged — only a bare requestId
    // marker. The closest thing to "the request" is the nearest preceding
    // business-log line for this same module, which often dumps the internal
    // object used to build the call. Best-effort only (see javaToString.js).
    let request = null
    for (let back = i - 1; back >= Math.max(0, i - 6); back--) {
      const candidate = calls[back]
      if (isHttpLogger(candidate)) continue
      if (candidate.name !== apiName) continue
      const parsed = parseJavaLikeObject(candidate.message ?? '')
      if (parsed) {
        request = parsed
        break
      }
    }

    found.push({
      key: `call-${i}`,
      apiName,
      timestamp: next.timestamp,
      requestId: (call.message ?? '').replace(/^requestId:\s*/, ''),
      request,
      response,
    })
  })

  return found
})

const timeline = computed(() => props.trace?.calls ?? [])
</script>

<template>
  <div class="trace">
    <div class="trace__summary">
      <span>{{ apiCalls.length }} internal API call{{ apiCalls.length === 1 ? '' : 's' }} matched</span>
      <span class="trace__summary-sub">{{ timeline.length }} total log lines</span>
    </div>

    <div v-if="apiCalls.length" class="trace__calls">
      <div v-for="call in apiCalls" :key="call.key" class="trace__call-group">
        <p class="trace__call-heading">{{ call.apiName }}</p>

        <template v-if="call.request">
          <p v-if="call.request.truncated" class="trace__note">
            Request reconstructed from a Java debug log (best effort) — truncated or approximate in places.
          </p>
          <p v-else class="trace__note">Request reconstructed from a Java debug log (best effort).</p>
          <FlightDetailResult :detail="call.request.value" :title="`${call.apiName} — request`" />
        </template>
        <p v-else class="trace__note">No request payload found in the logs for this call.</p>

        <FlightDetailResult
          v-if="typeof call.response === 'object' && call.response !== null"
          :detail="call.response"
          :title="`${call.apiName} — response`"
        />
        <div v-else class="trace__raw">
          <p class="trace__raw-title">{{ call.apiName }} — response (truncated by backend, not valid JSON)</p>
          <pre class="trace__raw-body">{{ call.response }}</pre>
        </div>
      </div>
    </div>
    <p v-else class="trace__empty">No request/response pairs could be matched — see the full log below.</p>

    <details class="trace__timeline">
      <summary>Full call log ({{ timeline.length }} entries)</summary>
      <div class="trace__timeline-list">
        <div v-for="(call, i) in timeline" :key="i" class="trace__entry">
          <span class="trace__entry-time">{{ call.timestamp?.slice(11, 23) }}</span>
          <span class="trace__entry-level" :class="`trace__entry-level--${(call.level || '').toLowerCase()}`">{{
            call.level
          }}</span>
          <span class="trace__entry-logger" :title="call.logger">{{ shortLogger(call.logger) }}</span>
          <span class="trace__entry-message" :title="call.message">{{ call.message }}</span>
        </div>
      </div>
    </details>
  </div>
</template>

<style scoped>
.trace {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.trace__summary {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-text-body);
}
.trace__summary-sub {
  color: var(--color-text-subtle);
  font-size: 0.78rem;
}
.trace__calls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.trace__call-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-soft);
}
.trace__call-group:last-child {
  padding-bottom: 0;
  border-bottom: none;
}
.trace__call-heading {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.trace__note {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-subtle);
  font-style: italic;
}
.trace__empty {
  margin: 0;
  padding: 1rem 1.1rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
.trace__raw {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  background: var(--color-bg);
}
.trace__raw-title {
  margin: 0 0 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
.trace__raw-body {
  margin: 0;
  max-height: 16rem;
  overflow: auto;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--color-text-body);
  white-space: pre-wrap;
  word-break: break-word;
}

.trace__timeline {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
}
.trace__timeline summary {
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  background: var(--color-bg);
}
.trace__timeline-list {
  max-height: 22rem;
  overflow-y: auto;
  padding: 0.5rem 0.75rem;
}
.trace__entry {
  display: grid;
  grid-template-columns: 6rem 4.5rem 12rem 1fr;
  gap: 0.6rem;
  align-items: start;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--color-border-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.72rem;
}
.trace__entry:last-child {
  border-bottom: none;
}
.trace__entry-time {
  color: var(--color-text-subtle);
  white-space: nowrap;
}
.trace__entry-level {
  font-weight: 700;
  white-space: nowrap;
}
.trace__entry-level--info {
  color: var(--color-accent);
}
.trace__entry-level--debug {
  color: var(--color-text-subtle);
}
.trace__entry-level--error {
  color: var(--color-danger);
}
.trace__entry-logger {
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.trace__entry-message {
  min-width: 0;
  color: var(--color-text-body);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  cursor: help;
}
</style>

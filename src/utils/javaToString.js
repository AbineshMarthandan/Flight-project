// Booking internal-call request payloads aren't logged as JSON — they're Java
// Lombok-style `ClassName{field=value, ...}` toString() dumps. This is a
// best-effort reconstruction into a plain JS object so it can go through the
// same JSON viewer as everything else. It is NOT a reliable general parser:
// this format doesn't escape apostrophes inside string values, so a field
// containing one (e.g. a name) desyncs quote-matching for everything after it
// — that's an ambiguity in the source data, not something parsing can fix.
export function parseJavaLikeObject(text) {
  const startMatch = text.match(/([A-Za-z][A-Za-z0-9_]*)\{/)
  if (!startMatch) return null

  let i = startMatch.index
  let truncated = false

  function skipWs() {
    while (i < text.length && /\s/.test(text[i])) i++
  }
  function readIdentifier() {
    const start = i
    while (i < text.length && /[A-Za-z0-9_.$]/.test(text[i])) i++
    return text.slice(start, i)
  }
  function readScalarUntilDelimiter() {
    const start = i
    let depth = 0
    while (i < text.length) {
      const ch = text[i]
      if (depth === 0 && (ch === ',' || ch === '}' || ch === ']')) break
      if (ch === '{' || ch === '[') depth++
      if (ch === '}' || ch === ']') depth--
      i++
    }
    const raw = text.slice(start, i).trim()
    if (raw === 'null') return null
    if (raw === 'true') return true
    if (raw === 'false') return false
    if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw)
    return raw
  }
  function parseQuoted() {
    i++
    const start = i
    while (i < text.length && text[i] !== "'") i++
    const value = text.slice(start, i)
    if (i >= text.length) truncated = true
    else i++
    return value
  }
  function parseArray() {
    i++
    const items = []
    skipWs()
    while (i < text.length && text[i] !== ']') {
      items.push(parseValue())
      skipWs()
      if (text[i] === ',') {
        i++
        skipWs()
      }
    }
    if (i >= text.length) truncated = true
    else i++
    return items
  }
  function parseObject(className) {
    i++
    const obj = { $type: className }
    skipWs()
    while (i < text.length && text[i] !== '}') {
      const keyStart = i
      while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i++
      const key = text.slice(keyStart, i)
      skipWs()
      if (text[i] !== '=') {
        truncated = true
        break
      }
      i++
      const value = parseValue()
      obj[key || `field${Object.keys(obj).length}`] = value
      skipWs()
      if (text[i] === ',') {
        i++
        skipWs()
      } else if (text[i] !== '}') {
        truncated = true
        break
      }
    }
    if (i >= text.length || text[i] !== '}') truncated = true
    else i++
    return obj
  }
  function parseValue() {
    skipWs()
    if (i >= text.length) {
      truncated = true
      return undefined
    }
    const ch = text[i]
    if (ch === "'") return parseQuoted()
    if (ch === '[') return parseArray()
    const idStart = i
    const id = readIdentifier()
    skipWs()
    if (text[i] === '{') return parseObject(id)
    if (text[i] === '@') {
      i++
      const hash = readIdentifier()
      return `${id}@${hash}`
    }
    i = idStart
    return readScalarUntilDelimiter()
  }

  const value = parseValue()
  return { value, truncated }
}

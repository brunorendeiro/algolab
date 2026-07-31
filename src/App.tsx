import { useEffect, useState } from 'react'
import { isNumberKey, isSortKey, numberGenerators, numberKeys, numberRangeConfig, searchKeys, searchers, sortKeys, sorters, type AlgoKey, type NumberKey } from './data/algorithms'
import { algoInfo } from './data/info'
import { getStoredConsent, loadAnalytics } from './analytics'
import CookieConsent from './CookieConsent'

const SIZE = 40
type Speed = 'slow' | 'normal' | 'fast'
const speedDelay: Record<Speed, number> = { fast: 8, normal: 20, slow: 55 }

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => 5 + Math.floor(Math.random() * 95))
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function App() {
  const [array, setArray] = useState<number[]>(() => randomArray(SIZE))
  const [algorithm, setAlgorithm] = useState<AlgoKey>('bubble')
  const [speed, setSpeed] = useState<Speed>('normal')
  const [isRunning, setIsRunning] = useState(false)
  const [active, setActive] = useState<number[]>([])
  const [sortedCount, setSortedCount] = useState(0)
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'found' | 'not-found'>('idle')
  const [target, setTarget] = useState<number | null>(null)
  const [searchRange, setSearchRange] = useState<{ lo: number; hi: number } | null>(null)
  const [eliminated, setEliminated] = useState<number[]>([])
  const [numberLabel, setNumberLabel] = useState('')
  const [rangeMin, setRangeMin] = useState(numberRangeConfig.fibonacci.defaultMin)
  const [rangeMax, setRangeMax] = useState(numberRangeConfig.fibonacci.defaultMax)

  useEffect(() => {
    if (getStoredConsent() === 'granted') loadAnalytics()
  }, [])
  const [foundIndex, setFoundIndex] = useState<number | null>(null)

  const info = algoInfo[algorithm]
  const isSort = isSortKey(algorithm)
  const isNumber = isNumberKey(algorithm)

  function resetVisualState() {
    setActive([])
    setSortedCount(0)
    setSearchRange(null)
    setFoundIndex(null)
    setEliminated([])
    setNumberLabel('')
    setStatus('idle')
  }

  function newArray() {
    if (isRunning) return
    if (isNumber) {
      resetVisualState()
      setArray([])
      return
    }
    setArray(randomArray(SIZE))
    setTarget(null)
    resetVisualState()
  }

  function changeAlgorithm(next: AlgoKey) {
    if (isRunning) return
    setAlgorithm(next)
    setTarget(null)
    resetVisualState()
    if (isNumberKey(next)) {
      setArray([])
      setRangeMin(numberRangeConfig[next].defaultMin)
      setRangeMax(numberRangeConfig[next].defaultMax)
    } else if (array.length !== SIZE) {
      setArray(randomArray(SIZE))
    }
  }

  function updateRange(which: 'min' | 'max', raw: string) {
    if (!isNumber) return
    const cfg = numberRangeConfig[algorithm as NumberKey]
    const value = Math.round(Number(raw))
    if (Number.isNaN(value)) return
    const clamped = Math.min(cfg.max, Math.max(cfg.min, value))
    if (which === 'min') setRangeMin(clamped)
    else setRangeMax(clamped)
  }

  function pickTarget(source: number[]): number {
    const showMissing = Math.random() < 0.25
    if (showMissing) return -1
    return source[Math.floor(Math.random() * source.length)]
  }

  async function sweepSorted(finalArray: number[]) {
    setActive([])
    for (let i = 0; i < finalArray.length; i++) {
      setSortedCount(i + 1)
      await sleep(6)
    }
    setStatus('done')
  }

  async function run() {
    if (isRunning) return
    setIsRunning(true)
    resetVisualState()

    if (isSort) {
      setStatus('running')
      const steps = sorters[algorithm](array)
      let last = array
      for (const step of steps) {
        setArray(step.array)
        setActive(step.active)
        last = step.array
        await sleep(speedDelay[speed])
      }
      await sweepSorted(last)
    } else if (isNumber) {
      setStatus('running')
      setArray([])
      const lo = Math.min(rangeMin, rangeMax)
      const hi = Math.max(rangeMin, rangeMax)
      const { steps, label } = numberGenerators[algorithm](lo, hi)
      setNumberLabel(label)
      const stepDelay = algorithm === 'gcd' ? speedDelay[speed] * 7 : algorithm === 'sieve' ? speedDelay[speed] : speedDelay[speed] * 3
      for (const step of steps) {
        setArray(step.array)
        setActive(step.active)
        setEliminated(step.eliminated)
        await sleep(stepDelay)
      }
      setStatus(steps.length ? 'done' : 'not-found')
    } else {
      let workingArray = array
      if (algorithm === 'binary') {
        workingArray = [...array].sort((a, b) => a - b)
        setArray(workingArray)
        await sleep(250)
      }
      const searchTarget = pickTarget(workingArray)
      setTarget(searchTarget)
      setStatus('running')
      const steps = searchers[algorithm](workingArray, searchTarget)
      let found = false
      for (const step of steps) {
        setActive([step.index])
        if (algorithm === 'binary') setSearchRange({ lo: step.lo ?? 0, hi: step.hi ?? workingArray.length - 1 })
        await sleep(speedDelay[speed] * 5)
        if (step.found) { found = true; setFoundIndex(step.index) }
      }
      setStatus(found ? 'found' : 'not-found')
    }
    setIsRunning(false)
  }

  const maxValue = Math.max(...array, 1)
  const logGrowth = algorithm === 'fibonacci' || algorithm === 'factorial'

  function barHeight(value: number): number {
    const cap = isNumber && algorithm !== 'sieve' ? 82 : 100
    if (logGrowth) return (Math.log(value + 1) / Math.log(maxValue + 1)) * cap
    return (value / maxValue) * cap
  }

  function barClass(index: number): string {
    if (isSort) {
      if (index < sortedCount) return 'bar sorted'
      if (active.includes(index)) return 'bar active'
      return 'bar'
    }
    if (isNumber) {
      if (eliminated.includes(index)) return 'bar dimmed'
      if (algorithm === 'gcd') return status === 'done' ? 'bar found' : 'bar active'
      if (algorithm === 'sieve') {
        if (active.includes(index)) return 'bar active'
        return status === 'done' ? 'bar sorted' : 'bar'
      }
      if (index === array.length - 1 && status === 'running') return 'bar active'
      return 'bar sorted'
    }
    if (foundIndex === index) return 'bar found'
    if (active.includes(index)) return 'bar active'
    if (algorithm === 'binary' && searchRange && (index < searchRange.lo || index > searchRange.hi)) return 'bar dimmed'
    return 'bar'
  }

  function numberDoneMessage(): string {
    if (algorithm === 'gcd') return `${numberLabel} = ${array[0]}`
    if (algorithm === 'sieve') return `${numberLabel} — found ${array.length - eliminated.length} primes.`
    return `${numberLabel} — done!`
  }

  return <div className="app-shell">
    <header>
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3h6M9 3v6.5L3.6 18.2A2 2 0 0 0 5.4 21h13.2a2 2 0 0 0 1.8-2.8L15 9.5V3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" fill="currentColor" fillOpacity=".18" />
            <circle cx="10.5" cy="18" r="1.1" fill="currentColor" />
            <circle cx="14" cy="15.5" r="0.9" fill="currentColor" />
            <circle cx="13" cy="18.8" r="0.6" fill="currentColor" />
          </svg>
        </span>
        <div><strong>AlgoLab</strong><small>A lab notebook for sorting, searching &amp; numbers</small></div>
      </div>
    </header>

    <main>
      <p className="intro">Pick a specimen, run the experiment, and read the method — <em>the actual code</em> — while it happens.</p>

      <section className="controls">
        <div className="control-group wide">
          <span>Sorting</span>
          <div className="segmented">
            {sortKeys.map(key => (
              <button key={key} className={algorithm === key ? 'active' : ''} disabled={isRunning} onClick={() => changeAlgorithm(key)}>{algoInfo[key].name}</button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <span>Searching</span>
          <div className="segmented">
            {searchKeys.map(key => (
              <button key={key} className={algorithm === key ? 'active' : ''} disabled={isRunning} onClick={() => changeAlgorithm(key)}>{algoInfo[key].name}</button>
            ))}
          </div>
        </div>
        <div className="control-group wide">
          <span>Numbers</span>
          <div className="segmented">
            {numberKeys.map(key => (
              <button key={key} className={algorithm === key ? 'active' : ''} disabled={isRunning} onClick={() => changeAlgorithm(key)}>{algoInfo[key].name}</button>
            ))}
          </div>
        </div>
        {isNumber && (
          <div className="control-group">
            <span>{numberRangeConfig[algorithm as NumberKey].fromLabel}</span>
            <div className="range-inputs">
              <input
                type="number"
                value={rangeMin}
                disabled={isRunning}
                min={numberRangeConfig[algorithm as NumberKey].min}
                max={numberRangeConfig[algorithm as NumberKey].max}
                onChange={e => updateRange('min', e.target.value)}
              />
              <span>{numberRangeConfig[algorithm as NumberKey].toLabel}</span>
              <input
                type="number"
                value={rangeMax}
                disabled={isRunning}
                min={numberRangeConfig[algorithm as NumberKey].min}
                max={numberRangeConfig[algorithm as NumberKey].max}
                onChange={e => updateRange('max', e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="control-group">
          <span>Speed</span>
          <div className="segmented">
            {(['slow', 'normal', 'fast'] as Speed[]).map(key => (
              <button key={key} className={speed === key ? 'active' : ''} disabled={isRunning} onClick={() => setSpeed(key)}>{key}</button>
            ))}
          </div>
        </div>
        <div className="control-actions">
          <button className="primary" disabled={isRunning} onClick={run}>{isRunning ? 'Running…' : 'Run'}</button>
          <button className="ghost" disabled={isRunning} onClick={newArray}>{isNumber ? 'New numbers' : 'New array'}</button>
        </div>
      </section>

      <p className={`status status-${status}`} role="status">
        {status === 'idle' && (isNumber ? `Ready — ${info.name}.` : 'Ready when you are.')}
        {status === 'running' && isSort && 'Sorting…'}
        {status === 'running' && isNumber && `${numberLabel || info.name}…`}
        {status === 'running' && !isSort && !isNumber && `Searching for ${target}…`}
        {status === 'done' && isSort && 'Sorted!'}
        {status === 'done' && isNumber && numberDoneMessage()}
        {status === 'found' && `Found ${target} at index ${foundIndex}.`}
        {status === 'not-found' && isNumber && numberLabel}
        {status === 'not-found' && !isNumber && `${target} isn't in the array.`}
      </p>

      <div className="bars">
        {array.map((value, index) => (
          <div key={index} className={barClass(index)} style={{ height: `${barHeight(value)}%` }}>
            {isNumber && algorithm !== 'sieve' && <span className="bar-value">{value}</span>}
          </div>
        ))}
      </div>

      <section className="info-card">
        <div className="info-head">
          <div>
            <span className="info-category">{info.category}</span>
            <h2>{info.name}</h2>
          </div>
          <div className="complexity">
            <div><span>Best</span><strong>{info.best}</strong></div>
            <div><span>Average</span><strong>{info.average}</strong></div>
            <div className="worst"><span>Worst</span><strong>{info.worst}</strong></div>
            <div><span>Space</span><strong>{info.space}</strong></div>
          </div>
        </div>
        <p>{info.summary}</p>
        <pre className="code-block"><code>{info.code}</code></pre>
      </section>
    </main>

    <footer>
      <span>Pure client-side: every algorithm runs for real on your array, no pre-baked animation.</span>
      <a href="https://vibe-portfolio-one.vercel.app/" target="_blank" rel="noreferrer">Created by Bruno Rendeiro</a>
      <span className="powered-badge">⚡ Powered by AI</span>
    </footer>
    <CookieConsent />
  </div>
}

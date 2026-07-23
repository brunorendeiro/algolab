import { useState } from 'react'
import { isSortKey, searchKeys, searchers, sortKeys, sorters, type AlgoKey } from './data/algorithms'
import { algoInfo } from './data/info'

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
  const [foundIndex, setFoundIndex] = useState<number | null>(null)

  const info = algoInfo[algorithm]
  const isSort = isSortKey(algorithm)

  function resetVisualState() {
    setActive([])
    setSortedCount(0)
    setSearchRange(null)
    setFoundIndex(null)
    setStatus('idle')
  }

  function newArray() {
    if (isRunning) return
    setArray(randomArray(SIZE))
    setTarget(null)
    resetVisualState()
  }

  function changeAlgorithm(next: AlgoKey) {
    if (isRunning) return
    setAlgorithm(next)
    setTarget(null)
    resetVisualState()
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

  function barClass(index: number): string {
    if (isSort) {
      if (index < sortedCount) return 'bar sorted'
      if (active.includes(index)) return 'bar active'
      return 'bar'
    }
    if (foundIndex === index) return 'bar found'
    if (active.includes(index)) return 'bar active'
    if (algorithm === 'binary' && searchRange && (index < searchRange.lo || index > searchRange.hi)) return 'bar dimmed'
    return 'bar'
  }

  return <div className="app-shell">
    <header>
      <div className="brand"><span className="brand-mark">AL</span><div><strong>AlgoLab</strong><small>Sorting &amp; searching, visualized</small></div></div>
    </header>

    <main>
      <p className="intro">Pick an algorithm, watch it run bar by bar, and read the real code alongside its complexity.</p>

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
          <button className="ghost" disabled={isRunning} onClick={newArray}>New array</button>
        </div>
      </section>

      <p className={`status status-${status}`} role="status">
        {status === 'idle' && 'Ready when you are.'}
        {status === 'running' && (isSort ? 'Sorting…' : `Searching for ${target}…`)}
        {status === 'done' && 'Sorted!'}
        {status === 'found' && `Found ${target} at index ${foundIndex}.`}
        {status === 'not-found' && `${target} isn't in the array.`}
      </p>

      <div className="bars">
        {array.map((value, index) => (
          <div key={index} className={barClass(index)} style={{ height: `${(value / maxValue) * 100}%` }} />
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
            <div><span>Worst</span><strong>{info.worst}</strong></div>
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
  </div>
}

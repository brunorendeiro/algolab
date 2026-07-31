export type SortStep = { array: number[]; active: number[]; swapped: boolean }

function snapshot(array: number[], active: number[], swapped: boolean): SortStep {
  return { array: [...array], active, swapped }
}

export function bubbleSort(input: number[]): SortStep[] {
  const array = [...input]
  const steps: SortStep[] = []
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - 1 - i; j++) {
      steps.push(snapshot(array, [j, j + 1], false))
      if (array[j] > array[j + 1]) {
        ;[array[j], array[j + 1]] = [array[j + 1], array[j]]
        steps.push(snapshot(array, [j, j + 1], true))
      }
    }
  }
  return steps
}

export function selectionSort(input: number[]): SortStep[] {
  const array = [...input]
  const steps: SortStep[] = []
  for (let i = 0; i < array.length - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < array.length; j++) {
      steps.push(snapshot(array, [minIndex, j], false))
      if (array[j] < array[minIndex]) minIndex = j
    }
    if (minIndex !== i) {
      ;[array[i], array[minIndex]] = [array[minIndex], array[i]]
      steps.push(snapshot(array, [i, minIndex], true))
    }
  }
  return steps
}

export function insertionSort(input: number[]): SortStep[] {
  const array = [...input]
  const steps: SortStep[] = []
  for (let i = 1; i < array.length; i++) {
    let j = i
    while (j > 0) {
      steps.push(snapshot(array, [j - 1, j], false))
      if (array[j - 1] > array[j]) {
        ;[array[j - 1], array[j]] = [array[j], array[j - 1]]
        steps.push(snapshot(array, [j - 1, j], true))
        j--
      } else break
    }
  }
  return steps
}

export function mergeSort(input: number[]): SortStep[] {
  const array = [...input]
  const steps: SortStep[] = []

  function merge(lo: number, mid: number, hi: number) {
    const left = array.slice(lo, mid + 1)
    const right = array.slice(mid + 1, hi + 1)
    const merged: number[] = []
    let i = 0
    let j = 0
    // Compare into a separate buffer first (not writing into `array` yet) so
    // the [lo + i, mid + 1 + j] snapshot indices still point at the original,
    // un-overwritten left/right values instead of already-merged output.
    while (i < left.length && j < right.length) {
      steps.push(snapshot(array, [lo + i, mid + 1 + j], false))
      if (left[i] <= right[j]) { merged.push(left[i]); i++ } else { merged.push(right[j]); j++ }
    }
    while (i < left.length) { merged.push(left[i]); i++ }
    while (j < right.length) { merged.push(right[j]); j++ }
    for (let k = 0; k < merged.length; k++) {
      array[lo + k] = merged[k]
      steps.push(snapshot(array, [lo + k], true))
    }
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  sort(0, array.length - 1)
  return steps
}

export function quickSort(input: number[]): SortStep[] {
  const array = [...input]
  const steps: SortStep[] = []

  function partition(lo: number, hi: number): number {
    const pivot = array[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      steps.push(snapshot(array, [j, hi], false))
      if (array[j] < pivot) {
        ;[array[i], array[j]] = [array[j], array[i]]
        steps.push(snapshot(array, [i, j], true))
        i++
      }
    }
    ;[array[i], array[hi]] = [array[hi], array[i]]
    steps.push(snapshot(array, [i, hi], true))
    return i
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  sort(0, array.length - 1)
  return steps
}

export type SearchStep = { index: number; lo?: number; hi?: number; found: boolean }

export function linearSearch(array: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = []
  for (let i = 0; i < array.length; i++) {
    steps.push({ index: i, found: array[i] === target })
    if (array[i] === target) break
  }
  return steps
}

export function binarySearch(array: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = []
  let lo = 0
  let hi = array.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    steps.push({ index: mid, lo, hi, found: array[mid] === target })
    if (array[mid] === target) break
    if (array[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return steps
}

export type NumberStep = { array: number[]; active: number[]; eliminated: number[] }

function numSnapshot(array: number[], active: number[], eliminated: number[]): NumberStep {
  return { array: [...array], active: [...active], eliminated: [...eliminated] }
}

export function fibonacciSteps(minVal: number, maxVal: number): NumberStep[] {
  const steps: NumberStep[] = []
  const visible: number[] = []
  const seq: number[] = []
  for (let i = 0; seq.length < 60; i++) {
    const value = i < 2 ? i + 1 : seq[i - 1] + seq[i - 2]
    seq.push(value)
    if (value > maxVal) break
    if (value >= minVal) {
      visible.push(value)
      steps.push(numSnapshot(visible, [visible.length - 1], []))
    }
  }
  return steps
}

export function factorialSteps(minVal: number, maxVal: number): NumberStep[] {
  const steps: NumberStep[] = []
  const visible: number[] = []
  let product = 1
  for (let i = 1; i <= 20; i++) {
    product *= i
    if (product > maxVal) break
    if (product >= minVal) {
      visible.push(product)
      steps.push(numSnapshot(visible, [visible.length - 1], []))
    }
  }
  return steps
}

export function gcdSteps(a: number, b: number): NumberStep[] {
  const steps: NumberStep[] = []
  let x = a
  let y = b
  while (y !== 0) {
    steps.push(numSnapshot([x, y], [0, 1], []))
    ;[x, y] = [y, x % y]
  }
  steps.push(numSnapshot([x, 0], [0], []))
  return steps
}

export function sieveSteps(minVal: number, maxVal: number): NumberStep[] {
  const steps: NumberStep[] = []
  const start = Math.max(2, minVal)
  const displayNumbers = Array.from({ length: Math.max(0, maxVal - start + 1) }, (_, i) => i + start)
  const composite = new Array(maxVal + 1).fill(false)
  const eliminated: number[] = []
  for (let p = 2; p * p <= maxVal; p++) {
    if (composite[p]) continue
    if (p >= start) steps.push(numSnapshot(displayNumbers, [p - start], eliminated))
    for (let m = p * p; m <= maxVal; m += p) {
      if (!composite[m]) {
        composite[m] = true
        if (m >= start) {
          eliminated.push(m - start)
          steps.push(numSnapshot(displayNumbers, [m - start], eliminated))
        }
      }
    }
  }
  steps.push(numSnapshot(displayNumbers, [], eliminated))
  return steps
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export type NumberRun = { steps: NumberStep[]; label: string }

export type NumberRangeConfig = { min: number; max: number; defaultMin: number; defaultMax: number; fromLabel: string; toLabel: string }

export const numberRangeConfig: Record<NumberKey, NumberRangeConfig> = {
  fibonacci: { min: 0, max: 1_000_000, defaultMin: 0, defaultMax: 1000, fromLabel: 'Value from', toLabel: 'to' },
  factorial: { min: 1, max: 1_000_000_000, defaultMin: 1, defaultMax: 100_000, fromLabel: 'Value from', toLabel: 'to' },
  gcd: { min: 2, max: 9999, defaultMin: 40, defaultMax: 400, fromLabel: 'Pick a, b from', toLabel: 'to' },
  sieve: { min: 2, max: 1000, defaultMin: 2, defaultMax: 60, fromLabel: 'Range from', toLabel: 'to' },
}

export const numberGenerators: Record<NumberKey, (min: number, max: number) => NumberRun> = {
  fibonacci: (min, max) => {
    const steps = fibonacciSteps(min, max)
    return { steps, label: steps.length ? `Fibonacci numbers from ${min} to ${max}` : `No Fibonacci numbers between ${min} and ${max}` }
  },
  factorial: (min, max) => {
    const steps = factorialSteps(min, max)
    return { steps, label: steps.length ? `Factorials from ${min} to ${max}` : `No factorials between ${min} and ${max}` }
  },
  gcd: (min, max) => {
    const a = randInt(min, max)
    const b = randInt(min, max)
    return { steps: gcdSteps(a, b), label: `gcd(${a}, ${b})` }
  },
  sieve: (min, max) => {
    const steps = sieveSteps(min, max)
    return { steps, label: `Primes from ${min} to ${max}` }
  },
}

export type SortKey = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'
export type SearchKey = 'linear' | 'binary'
export type NumberKey = 'fibonacci' | 'factorial' | 'gcd' | 'sieve'
export type AlgoKey = SortKey | SearchKey | NumberKey

export const sortKeys: SortKey[] = ['bubble', 'selection', 'insertion', 'merge', 'quick']
export const searchKeys: SearchKey[] = ['linear', 'binary']
export const numberKeys: NumberKey[] = ['fibonacci', 'factorial', 'gcd', 'sieve']

export const sorters: Record<SortKey, (input: number[]) => SortStep[]> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
}

export const searchers: Record<SearchKey, (array: number[], target: number) => SearchStep[]> = {
  linear: linearSearch,
  binary: binarySearch,
}

export function isSortKey(key: AlgoKey): key is SortKey {
  return (sortKeys as string[]).includes(key)
}

export function isNumberKey(key: AlgoKey): key is NumberKey {
  return (numberKeys as string[]).includes(key)
}

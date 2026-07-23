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

export type SortKey = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'
export type SearchKey = 'linear' | 'binary'
export type AlgoKey = SortKey | SearchKey

export const sortKeys: SortKey[] = ['bubble', 'selection', 'insertion', 'merge', 'quick']
export const searchKeys: SearchKey[] = ['linear', 'binary']

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

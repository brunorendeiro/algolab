import type { AlgoKey } from './algorithms'

export type AlgoInfo = {
  name: string
  category: 'Sorting' | 'Searching' | 'Numbers'
  summary: string
  best: string
  average: string
  worst: string
  space: string
  code: string
}

export const algoInfo: Record<AlgoKey, AlgoInfo> = {
  bubble: {
    name: 'Bubble Sort',
    category: 'Sorting',
    summary: 'Repeatedly steps through the array, swapping adjacent elements that are out of order. Each full pass "bubbles" the largest remaining value to its final position.',
    best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
    code: `for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - 1 - i; j++) {
    if (arr[j] > arr[j + 1]) {
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
    }
  }
}`,
  },
  selection: {
    name: 'Selection Sort',
    category: 'Sorting',
    summary: 'Scans the unsorted portion for the smallest remaining value and swaps it into place, one position at a time.',
    best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
    code: `for (let i = 0; i < n - 1; i++) {
  let min = i
  for (let j = i + 1; j < n; j++) {
    if (arr[j] < arr[min]) min = j
  }
  if (min !== i) [arr[i], arr[min]] = [arr[min], arr[i]]
}`,
  },
  insertion: {
    name: 'Insertion Sort',
    category: 'Sorting',
    summary: 'Builds the sorted array one element at a time, inserting each new value into its correct position among the already-sorted prefix.',
    best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)',
    code: `for (let i = 1; i < n; i++) {
  let j = i
  while (j > 0 && arr[j - 1] > arr[j]) {
    [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]
    j--
  }
}`,
  },
  merge: {
    name: 'Merge Sort',
    category: 'Sorting',
    summary: 'Divides the array in half recursively until each piece has one element, then merges pieces back together in sorted order.',
    best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',
    code: `function sort(lo, hi) {
  if (lo >= hi) return
  const mid = (lo + hi) >> 1
  sort(lo, mid)
  sort(mid + 1, hi)
  merge(lo, mid, hi)
}`,
  },
  quick: {
    name: 'Quick Sort',
    category: 'Sorting',
    summary: 'Picks a pivot, partitions the array so smaller values end up left of it and larger values right, then recurses on each side.',
    best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)',
    code: `function sort(lo, hi) {
  if (lo >= hi) return
  const p = partition(lo, hi)
  sort(lo, p - 1)
  sort(p + 1, hi)
}`,
  },
  linear: {
    name: 'Linear Search',
    category: 'Searching',
    summary: 'Checks every element in order until it finds the target (or reaches the end). Works on any array, sorted or not.',
    best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)',
    code: `for (let i = 0; i < n; i++) {
  if (arr[i] === target) return i
}
return -1`,
  },
  binary: {
    name: 'Binary Search',
    category: 'Searching',
    summary: 'Repeatedly halves the search range by comparing the target to the middle element — only works on a sorted array, but is dramatically faster.',
    best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)',
    code: `let lo = 0, hi = n - 1
while (lo <= hi) {
  const mid = (lo + hi) >> 1
  if (arr[mid] === target) return mid
  if (arr[mid] < target) lo = mid + 1
  else hi = mid - 1
}
return -1`,
  },
  fibonacci: {
    name: 'Fibonacci Sequence',
    category: 'Numbers',
    summary: 'Builds the sequence iteratively, where each new term is the sum of the previous two — the classic warm-up interview question, usually followed by "now do it without recursion."',
    best: 'O(n)', average: 'O(n)', worst: 'O(n)', space: 'O(1)',
    code: `let seq = []
for (let i = 0; ; i++) {
  const value = i < 2 ? i + 1 : seq[i - 1] + seq[i - 2]
  if (value > max) break
  seq.push(value)
  if (value >= min) reveal(value)
}`,
  },
  factorial: {
    name: 'Factorial',
    category: 'Numbers',
    summary: 'Multiplies every integer from 1 up, one term at a time. Grows so fast that a handful of terms already dwarfs the earlier ones — a good excuse to talk about number overflow in interviews.',
    best: 'O(n)', average: 'O(n)', worst: 'O(n)', space: 'O(1)',
    code: `let product = 1
for (let i = 1; ; i++) {
  product *= i
  if (product > max) break
  if (product >= min) reveal(product)
}`,
  },
  gcd: {
    name: 'Greatest Common Divisor',
    category: 'Numbers',
    summary: "Euclid's algorithm: repeatedly replace the pair (a, b) with (b, a mod b) until b hits zero — the surviving value is the GCD. Same idea behind reducing a fraction to lowest terms.",
    best: 'O(log(min(a,b)))', average: 'O(log(min(a,b)))', worst: 'O(log(min(a,b)))', space: 'O(1)',
    code: `while (b !== 0) {
  [a, b] = [b, a % b]
}
return a`,
  },
  sieve: {
    name: 'Sieve of Eratosthenes',
    category: 'Numbers',
    summary: 'Starting from 2, crosses out every multiple of each surviving number. What is never crossed out is prime — far faster than checking each number for divisibility one by one.',
    best: 'O(n log log n)', average: 'O(n log log n)', worst: 'O(n log log n)', space: 'O(n)',
    code: `for (let p = 2; p * p <= max; p++) {
  if (isPrime[p]) {
    for (let m = p * p; m <= max; m += p) {
      isPrime[m] = false
    }
  }
}
// reveal survivors where value >= min`,
  },
}

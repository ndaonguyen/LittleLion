/** Return a shuffled copy (Fisher-Yates). */
export function shuffled(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick n random elements (without replacement). */
export function pickRandom(items, n) {
  return shuffled(items).slice(0, n);
}

/** Pick a single random element. */
export function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

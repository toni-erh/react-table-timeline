export function areArraysEqual<T>(ar1: Array<T>, ar2: Array<T>) {
  return !ar1.find((v, i) => v !== ar2[i]);
}

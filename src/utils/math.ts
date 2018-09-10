export const minmax = (min: number, value: number, max: number) =>
  Math.max(min, Math.min(max, value))

export const rnd = (min: number, max: number) =>
  Math.random() * (max - min) + min

export const buildSrcSet = (base: string, widths: number[], ext: string = 'webp') =>
  widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

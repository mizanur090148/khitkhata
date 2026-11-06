const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function bnNum(n: number | string | undefined | null): string {
  if (n === null || n === undefined) return '০';
  return String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function fmtKg(n: number | string | undefined | null): string {
  const v = Math.round(Number(n) || 0);
  return `${bnNum(v.toLocaleString('en-IN'))} kg`;
}

export function fmtTk(n: number | string | undefined | null): string {
  const v = Math.round(Number(n) || 0);
  return `৳ ${bnNum(v.toLocaleString('en-IN'))}`;
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

export function buildDeterministicQrMatrix(seedStr: string): number[][] {
  let seed = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    seed ^= seedStr.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const n = 21;
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  const placeFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = edge || core ? 1 : 0;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, n - 7);
  placeFinder(n - 7, 0);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inFinder =
        (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
      if (inFinder) continue;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      grid[r][c] = (seed >>> 0) % 2 === 0 ? 1 : 0;
    }
  }

  return grid;
}


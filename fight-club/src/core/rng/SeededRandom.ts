import type { Random } from "@/core/rng/Random";

export class SeededRandom implements Random {
  constructor(private seed: number) {}

  next() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}


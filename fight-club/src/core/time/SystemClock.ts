import type { Clock } from "@/core/time/Clock";

export class SystemClock implements Clock {
  now() {
    return Date.now();
  }
}


import type { SaveRepository } from "@/core/storage/SaveRepository";

export class LocalStorageSaveRepository implements SaveRepository {
  constructor(private readonly storageKey: string) {}

  save<TValue>(payload: TValue) {
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  load<TValue>() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as TValue) : null;
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}


export interface SaveRepository {
  save<TValue>(payload: TValue): void;
  load<TValue>(): TValue | null;
  clear(): void;
}


export type EventPayload = Record<string, unknown>;

export type EventHandler<TPayload extends EventPayload> = (payload: TPayload) => void;
type BaseEventHandler = (payload: EventPayload) => void;
type PayloadFor<TEvents, TKey extends keyof TEvents> = TEvents[TKey] extends EventPayload
  ? TEvents[TKey]
  : never;

export class EventBus<TEvents extends object = Record<string, EventPayload>> {
  private listeners = new Map<keyof TEvents, Set<BaseEventHandler>>();

  on<TKey extends keyof TEvents>(eventName: TKey, handler: EventHandler<PayloadFor<TEvents, TKey>>) {
    const current = this.listeners.get(eventName) ?? new Set<BaseEventHandler>();
    current.add(handler as BaseEventHandler);
    this.listeners.set(eventName, current);

    return () => {
      current.delete(handler as BaseEventHandler);
    };
  }

  emit<TKey extends keyof TEvents>(eventName: TKey, payload: PayloadFor<TEvents, TKey>) {
    const current = this.listeners.get(eventName);

    if (!current) {
      return;
    }

    for (const handler of current) {
      handler(payload);
    }
  }
}

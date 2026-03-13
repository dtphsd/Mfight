import { EventBus } from "@/core/event-bus/EventBus";
import type { AppEventMap } from "@/core/event-bus/eventTypes";

export function createEventBus() {
  return new EventBus<AppEventMap>();
}


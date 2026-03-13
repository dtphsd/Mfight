import { createEventBus } from "@/core/event-bus/createEventBus";

describe("EventBus", () => {
  it("emits events to subscribers", () => {
    const eventBus = createEventBus();
    const spy = vi.fn();

    eventBus.on("character.created", spy);
    eventBus.emit("character.created", { characterId: "c-1", name: "Test" });

    expect(spy).toHaveBeenCalledWith({ characterId: "c-1", name: "Test" });
  });
});


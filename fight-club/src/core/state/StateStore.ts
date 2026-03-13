export class StateStore<TState extends Record<string, unknown> = Record<string, unknown>> {
  private state: TState = {} as TState;

  getSnapshot() {
    return this.state;
  }

  replace(nextState: TState) {
    this.state = nextState;
  }

  patch(partial: Partial<TState>) {
    this.state = {
      ...this.state,
      ...partial,
    };
  }
}


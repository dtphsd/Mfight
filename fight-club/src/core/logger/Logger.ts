export interface Logger {
  info(message: string, payload?: unknown): void;
  warn(message: string, payload?: unknown): void;
  error(message: string, payload?: unknown): void;
}

class ConsoleLogger implements Logger {
  info(message: string, payload?: unknown) {
    console.info(message, payload);
  }

  warn(message: string, payload?: unknown) {
    console.warn(message, payload);
  }

  error(message: string, payload?: unknown) {
    console.error(message, payload);
  }
}

export function createLogger(): Logger {
  return new ConsoleLogger();
}


import { randomUUID } from 'node:crypto';
import { EVENT_TYPE, FUNCTION, HTTP_METHOD, HTTP_REQ, Logger, STATUS } from '@mediaset/logger';

type LogLevel = 'info' | 'warn' | 'error';

/** Converts any value to a string for a log event. Never throws, so logging can't break a request. */
export function serialize(data: unknown): string | undefined {
  if (typeof data === 'string') return data;

  const ancestors: unknown[] = [];
  const replacer = function (this: unknown, _key: string, value: unknown): unknown {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value !== 'object' || value === null) return value;

    // Drop the objects we have already left, so only true cycles are flagged
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();
    if (ancestors.includes(value)) return '[Circular]';
    ancestors.push(value);

    if (value instanceof Error) {
      // Error properties aren't enumerable, so JSON.stringify would otherwise output {}
      const plain = Object.fromEntries(Object.getOwnPropertyNames(value).map((name) => [name, Reflect.get(value, name)]));
      ancestors.push(plain);
      return plain;
    }
    return value;
  };

  try {
    return JSON.stringify(data, replacer);
  } catch (error) {
    return `[Unserializable: ${String(error)}]`;
  }
}

/** Prints a line straight away, rather than waiting for a trace to be dumped. */
export function logNow(data: Record<string, unknown>, level: LogLevel = 'info'): void {
  const logId = randomUUID();
  Logger[level](data, logId);
  Logger.dumpLog(logId, true);
}

/**
 * Collects everything that happens during one request. @mediaset/logger buffers
 * the events and prints them as a single JSON line when flush() is called.
 *
 * Services receive an instance of this class and use step() to record what they
 * do: requests to other services, their responses, computed results, etc.
 */
export class TraceLogger {
  readonly traceId = randomUUID();

  constructor() {
    // dumpLog doesn't print the log ID, so the traceId has to be part of the line itself
    Logger.info({ traceId: this.traceId }, this.traceId);
  }

  /** Records a step of the request. */
  step(fn: string, msg: string, data?: unknown): void {
    this.addFunctionEvent(fn, msg, STATUS.OK, data);
  }

  /** Records a handled problem, such as a client error. The line is never sampled out. */
  warn(fn: string, msg: string, data?: unknown): void {
    this.addFunctionEvent(fn, msg, STATUS.ERR, data);
    Logger.warn({}, this.traceId);
  }

  /** Records a failure. The line goes to stderr at error level and is never sampled out. */
  error(fn: string, msg: string, error: unknown): void {
    this.addFunctionEvent(fn, msg, STATUS.ERR, error);
    Logger.error({}, this.traceId);
  }

  /** Prints a line straight away with this traceId, so a hung or crashed request still leaves a trace. */
  logNow(data: Record<string, unknown>): void {
    const logId = `${this.traceId}:start`;
    Logger.info({ traceId: this.traceId, ...data }, logId);
    Logger.dumpLog(logId, true);
  }

  /** Records the outcome of the HTTP request. */
  httpRequest(method: string, path: string, statusCode: number, duration: number): void {
    Logger.addEvent<HTTP_REQ>(
      {
        type: EVENT_TYPE.HTTP_REQ,
        name: 'http.request',
        method: method as HTTP_METHOD,
        path,
        statusCode,
        duration,
      },
      this.traceId,
    );
  }

  /** Prints the trace and releases it from memory. */
  flush(): void {
    Logger.dumpLog(this.traceId, true);
  }

  private addFunctionEvent(fn: string, msg: string, status: STATUS, data: unknown): void {
    Logger.addEvent<FUNCTION>(
      {
        type: EVENT_TYPE.FUNCTION,
        name: fn,
        fn,
        msg,
        status,
        data: serialize(data),
      },
      this.traceId,
    );
  }
}

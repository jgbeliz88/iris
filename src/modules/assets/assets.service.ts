import { TraceLogger } from '../../shared/logger/trace-logger';

/** Returns the payload it receives for now. The copy logic will go here. */
export function startCopy<T>(payload: T, log: TraceLogger): T {
  log.step('assets.startCopy', 'Returning received payload', payload);
  return payload;
}

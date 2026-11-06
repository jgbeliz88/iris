import { env } from '../../config/env';
import { TraceLogger } from '../../shared/logger/trace-logger';

export interface StartCopyResult<T> {
  body: T;
  enigmaBaseUrl: string;
}

/** Returns the payload it receives and the Enigma URL for now. The copy logic will go here. */
export function startCopy<T>(payload: T, log: TraceLogger): StartCopyResult<T> {
  const result = { body: payload, enigmaBaseUrl: env.enigmaBaseUrl };
  log.step('assets.startCopy', 'Returning received payload and Enigma base URL', result);
  return result;
}

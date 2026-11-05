import { TraceLogger } from '../../shared/logger/trace-logger';

export interface StatusResult {
  code: string;
  statusCode: number;
}

export function getSimpleStatus(log: TraceLogger): StatusResult {
  const result: StatusResult = { code: 'OK', statusCode: 200 };
  log.step('status.getSimpleStatus', 'Status computed', result);
  return result;
}

/** Returns the same as the simple status for now. Deeper checks will go here. */
export function getCompleteStatus(log: TraceLogger): StatusResult {
  log.step('status.getCompleteStatus', 'Computing complete status');
  return getSimpleStatus(log);
}

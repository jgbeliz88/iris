import { logNow } from '../shared/logger/trace-logger';

const missing: string[] = [];

function required(name: string): string {
  const value = process.env[name];
  if (!value) missing.push(name);
  return value ?? '';
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  enigmaBaseUrl: required('ENIGMA_BASE_URL'),
  mediaCopilotBaseUrl: required('MEDIA_COPILOT_BASE_URL'),
  mediaCopilotApiToken: required('MEDIA_COPILOT_API_TOKEN'),
};

// Runs once at startup, on first import and before the server starts listening.
// Exits instead of throwing because the fatal error handlers in index.ts aren't
// registered yet, so a throw wouldn't produce a standard log line.
if (missing.length > 0) {
  logNow({ msg: `Missing required environment variables: ${missing.join(', ')}` }, 'error');
  process.exit(1);
}

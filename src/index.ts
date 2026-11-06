import { buildApp } from './app';
import { env } from './config/env';
import { logNow, serialize } from './shared/logger/trace-logger';

const app = buildApp();

function exitOnFatalError(msg: string, error: unknown): void {
  logNow({ msg, error: serialize(error) }, 'error');
  process.exit(1);
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logNow({ msg: `Received ${signal}, shutting down` });
  try {
    // Waits for in-flight requests, so their trace lines still get printed
    await app.close();
    process.exit(0);
  } catch (error) {
    exitOnFatalError('Error during shutdown', error);
  }
}

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
process.on('uncaughtException', (error) => exitOnFatalError('Uncaught exception', error));
process.on('unhandledRejection', (reason) => exitOnFatalError('Unhandled rejection', reason));

app.listen({ port: env.port, host: env.host }).then(
  (address) => logNow({ msg: `Server listening at ${address}` }),
  (error) => exitOnFatalError('Server failed to start', error),
);

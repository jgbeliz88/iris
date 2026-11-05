import 'fastify';
import { TraceLogger } from '../logger/trace-logger';

declare module 'fastify' {
  interface FastifyRequest {
    trace: TraceLogger;
  }
}

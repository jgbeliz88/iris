import fp from 'fastify-plugin';
import { TraceLogger } from '../shared/logger/trace-logger';

const FN = 'http.requestLogger';

export default fp(async (fastify) => {
  fastify.decorateRequest('trace', null as unknown as TraceLogger);

  fastify.addHook('onRequest', async (request) => {
    request.trace = new TraceLogger();
  });

  // The first hook where the body is available. A body that fails to parse never gets
  // here, but the trace line printed in onResponse still records that request.
  fastify.addHook('preValidation', async (request) => {
    const { method, url: path, query, body } = request;
    const details = { method, path, query, body };

    request.trace.logNow({ msg: 'Request started', request: details });
    request.trace.step(FN, 'Request received', details);
  });

  fastify.addHook('onSend', async (request, _reply, payload) => {
    const body = typeof payload === 'string' || payload == null ? payload : '[Non-text payload]';
    request.trace.step(FN, 'Response sent', body);
    return payload;
  });

  fastify.addHook('onResponse', async (request, reply) => {
    request.trace.httpRequest(request.method, request.url, reply.statusCode, reply.elapsedTime);
    request.trace.flush();
  });
});

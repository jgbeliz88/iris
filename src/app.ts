import Fastify, { FastifyReply } from 'fastify';
import assetsRoutes from './modules/assets/assets.routes';
import statusRoutes from './modules/status/status.routes';
import errorHandlerPlugin from './plugins/error-handler.plugin';
import requestLoggerPlugin from './plugins/request-logger.plugin';
import { logNow, serialize } from './shared/logger/trace-logger';

export function buildApp() {
  const app = Fastify({
    // Malformed URLs are rejected before any hook runs, so the plugins never see them
    frameworkErrors: (error, request, reply: FastifyReply) => {
      const { method, url: path } = request;
      logNow({ msg: 'Request rejected', request: { method, path }, error: serialize(error) }, 'warn');

      return reply.code(400).send({ code: error.code, statusCode: 400, message: error.message });
    },
  });

  app.register(requestLoggerPlugin);
  app.register(errorHandlerPlugin);

  app.register(statusRoutes, { prefix: '/status' });
  app.register(assetsRoutes, { prefix: '/assets' });

  return app;
}

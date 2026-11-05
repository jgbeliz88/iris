import { FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../shared/errors/app-error';

const FN = 'http.errorHandler';

export default fp(async (fastify) => {
  fastify.setErrorHandler<FastifyError>((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const isServerError = statusCode >= 500;

    if (isServerError) {
      request.trace.error(FN, 'Request failed', error);
    } else {
      request.trace.warn(FN, 'Request rejected', error);
    }

    // Only messages we wrote on purpose reach the client on a 5xx
    const isExposed = !isServerError || error instanceof AppError;

    return reply.code(statusCode).send({
      code: isExposed ? error.code : 'INTERNAL_SERVER_ERROR',
      statusCode,
      message: isExposed ? error.message : 'Internal Server Error',
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    const message = `Route ${request.method} ${request.url} not found`;
    request.trace.warn(FN, message);

    return reply.code(404).send({ code: 'NOT_FOUND', statusCode: 404, message });
  });
});

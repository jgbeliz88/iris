import { FastifyReply, FastifyRequest } from 'fastify';
import { getCompleteStatus, getSimpleStatus } from './status.service';

export async function statusSimpleController(request: FastifyRequest, reply: FastifyReply) {
  const result = getSimpleStatus(request.trace);
  return reply.code(result.statusCode).send(result);
}

export async function statusCompleteController(request: FastifyRequest, reply: FastifyReply) {
  const result = getCompleteStatus(request.trace);
  return reply.code(result.statusCode).send(result);
}

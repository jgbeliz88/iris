import { FastifyReply, FastifyRequest } from 'fastify';
import { startCopy } from './assets.service';

export async function startCopyController(request: FastifyRequest, reply: FastifyReply) {
  const result = startCopy(request.body, request.trace);
  return reply.code(200).send(result);
}

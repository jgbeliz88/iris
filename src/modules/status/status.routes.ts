import { FastifyInstance } from 'fastify';
import { statusCompleteController, statusSimpleController } from './status.controller';

export default async function statusRoutes(fastify: FastifyInstance) {
  fastify.get('/status-simple', statusSimpleController);
  fastify.get('/status-complete', statusCompleteController);
}

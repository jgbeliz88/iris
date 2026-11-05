import { FastifyInstance } from 'fastify';
import { startCopyController } from './assets.controller';

export default async function assetsRoutes(fastify: FastifyInstance) {
  fastify.post('/startCopy', startCopyController);
}

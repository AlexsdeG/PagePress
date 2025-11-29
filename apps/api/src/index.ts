import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({ logger: true });

server.register(cors, { 
  origin: true // Allow dev frontend to connect
});

server.get('/', async (request, reply) => {
  return { status: 'ok', message: 'PagePress API Running' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
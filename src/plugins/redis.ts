import fp from 'fastify-plugin'
import fastifyRedis from '@fastify/redis'

export default fp(async (fastify) => {
  fastify.register(fastifyRedis, { 
    url: fastify.config.REDIS_URL,
    closeClient: true,
  })
})
import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyInstance, FastifyRequest } from 'fastify'

/**
 * This plugins adds jwt verification
 *
 */
export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(jwt, {
    secret: fastify.config.JWT_SECRET
  })

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply) {
    await request.jwtVerify()
  })
  
  fastify.decorate('sign', (payload) => fastify.jwt.sign({ payload }))
})

declare module 'fastify' {
    export interface FastifyInstance {
      sign: (payload: string) => string
      authenticate: (request: FastifyRequest, reply: any) => Promise<void>
    }
}

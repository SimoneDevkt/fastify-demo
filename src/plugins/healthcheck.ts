import {type FastifyInstance} from 'fastify'
import underPressure from '@fastify/under-pressure'
import fp from 'fastify-plugin'

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const {prisma} = fastify
    await fastify.register(underPressure, {
      healthCheck: async function () {
        //check if db connection is healthy
        try {
          await prisma.$connect()
          return true
        } catch (err) {
          fastify.log.warn({err}, 'Healthcheck failed')
          return false
        }
      },
      healthCheckInterval: 500,
      exposeStatusRoute: {
        url: '/status/health',
        routeOpts: {
          logLevel: 'debug',
        },
        routeSchemaOpts: {
          // If you also want to set a custom route schema
          hide: true,
        },
      },
    })
  },
  {
    dependencies: ['prisma'],
    fastify: '5.x',
    name: 'healthCheck',
  },
)

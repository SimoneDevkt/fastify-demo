import {type FastifyInstance} from 'fastify'
import fp from 'fastify-plugin'
import {PrismaClient} from '@prisma/client'

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const {log} = fastify
    if (!fastify.hasDecorator('prisma')) {
      const prisma = new PrismaClient({
        datasourceUrl: fastify.config.DATABASE_URL,
      })
      await prisma.$connect()
      log.info('Databases Connected')
      fastify.decorate('prisma', prisma).addHook('onClose', async server => {
        await server.prisma.$disconnect()
      })
    } else {
      throw new Error('The `prisma` decorator has already been registered.')
    }
  },
  {
    fastify: '5.x',
    name: 'prisma',
  },
)

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

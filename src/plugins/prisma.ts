import {type FastifyInstance} from 'fastify'
import fp from 'fastify-plugin'
//import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    const {log, config} = fastify
    const adapter = new PrismaPg({ connectionString: config.DATABASE_URL })
    if (!fastify.hasDecorator('prisma')) {
      const prisma = new PrismaClient({
        adapter
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

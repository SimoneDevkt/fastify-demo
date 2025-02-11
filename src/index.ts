import Fastify from 'fastify'
import {app, options} from './app.ts'

import fastifyEnv from '@fastify/env'
import {type Static, Type} from '@sinclair/typebox'

const fastify = Fastify(options)

declare module 'fastify' {
  interface FastifyInstance {
    config: Static<typeof schema>
  }
}

const schema = Type.Object({
  HOSTNAME: Type.String(),
  PORT: Type.Number(),
  DATABASE_URL: Type.String(),
  REDIS_URL: Type.String(),
  JWT_SECRET: Type.String(),
})

const start = async () => {
  try {
    await fastify.register(fastifyEnv, {
      schema,
    })

    const {PORT: port, HOSTNAME: host} = fastify.config

    await fastify.register(app)
    await fastify.listen({
      port,
      host,
    })
    // const address = fastify.server.address()
    // const port = typeof address === 'string' ? address : address?.port
  } catch (err) {
    console.error(err)
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

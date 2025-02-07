import Fastify from 'fastify'
import {app, options} from '../src/app.ts'

export async function getServer() {

  // Add your config customizations here
  const fastify = Fastify({
    ...options,
  })
  //create env for testing
  fastify.decorate('config', {
  } as never)

  fastify.addHook('preClose', async () => {
  })

  await fastify.register(app) // buildServer(config)

  return fastify
}

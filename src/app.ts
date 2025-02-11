import {join} from 'path'
import AutoLoad from '@fastify/autoload'
import type {AutoloadPluginOptions} from '@fastify/autoload'
import type { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Pass --options via CLI arguments in command to enable these options.

const options: AppOptions = {
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  fastify.addHook('onError', async (request, reply, error) => {
    // Useful for custom error logging
    // You should not use this hook to update the error
  })


  // This loads all plugins defined in plugins.
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  })
  // This loads all plugins defined in routes
  // define your routes in one of these.
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })
}

export default app
export {app, options}

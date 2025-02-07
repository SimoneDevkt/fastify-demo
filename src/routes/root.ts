import {type FastifyPluginAsyncTypebox, Type} from '@fastify/type-provider-typebox'

const root: FastifyPluginAsyncTypebox = async function (fastify) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
}

export default root;

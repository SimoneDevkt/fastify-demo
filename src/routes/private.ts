import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox'

const privatePage: FastifyPluginAsyncTypebox = async function (fastify) {
  
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.get('/private', async function (request, reply) {
    return { private: "private info" }
  })

}

export default privatePage

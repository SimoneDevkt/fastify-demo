import {type FastifyPluginAsyncTypebox, Type} from '@fastify/type-provider-typebox'

const product: FastifyPluginAsyncTypebox = async function (fastify) {
  const { prisma, httpErrors } = fastify
  const Product = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    price: Type.Number()
  })

  fastify.get('/products', {
    schema: {
      response: {
        200: Type.Array(Product)
      }
    }
  }, async (request, reply) => {
    const products = await prisma.product.findMany()
    return products
  })

  fastify.post('/products', {
    schema: {
      body: Type.Object({
        name: Type.String(),
        description: Type.Optional(Type.String()),
        price: Type.Number()
      }),
      response: {
        201: Product
      }
    }
  }, async (request, reply) => {
    const newProduct = await prisma.product.create({
      data: request.body
    })
    reply.code(201)
    return newProduct
  })

  fastify.put('/products/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number()
      }),
      body: Type.Object({
        name: Type.String(),
        description: Type.Optional(Type.String()),
        price: Type.Number()
      }),
      response: {
        200: Product
      }
    }
  }, async (request, reply) => {
    const updatedProduct = await prisma.product.update({
      where: { id: request.params.id },
      data: request.body
    })
    return updatedProduct
  })

  fastify.delete('/products/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number()
      }),
      response: {
        204: Type.Null()
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    await prisma.product.delete({
      where: { id }
    })
    reply.code(204)
  })

}

export default product
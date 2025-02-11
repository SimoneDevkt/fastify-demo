import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'

const product: FastifyPluginAsyncTypebox = async function (fastify) {
  const { prisma, httpErrors, redis } = fastify
  
  const cacheKey = 'products'

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
    const cachedProducts = await redis.get(cacheKey)
    if (cachedProducts) {
      return JSON.parse(cachedProducts)
    }

    const products = await prisma.product.findMany()
    await redis.set(cacheKey, JSON.stringify(products), 'EX', 3600) // Cache for 1 hour
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
    await redis.del(cacheKey) // Invalidate cache
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
    await redis.del(cacheKey) // Invalidate cache
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
    await redis.del(cacheKey) // Invalidate cache
    reply.code(204)
  })
}

export default product
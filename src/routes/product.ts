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

  
  fastify.get('/products/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number()
      }),
      response: {
        200: Product,
        404: {$ref: 'HttpError'},
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    const cacheKey = `product:${id}`
    const cachedProduct = await redis.get(cacheKey)
    if (cachedProduct) {
      return JSON.parse(cachedProduct)
    }

    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw httpErrors.notFound('Product not found')
    }

    await redis.set(cacheKey, JSON.stringify(product), 'EX', 3600) // Cache for 1 hour
    return product
  })

  fastify.get('/products', {
    schema: {
      response: {
        200: Type.Array(Product),
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
        201: Product,
        400: {$ref: 'HttpError'},
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
        200: Product,        
        404: {$ref: 'HttpError'},
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: request.body
      }).catch((error) => {
        throw httpErrors.notFound('Product not found')
      })
      await redis.del(`product:${id}`) // Invalidate cache for the specific product
      await redis.del(cacheKey) // Invalidate cache
      return updatedProduct
  })

  fastify.delete('/products/:id', {
    schema: {
      params: Type.Object({
        id: Type.Number()
      }),
      response: {
        204: Type.Null(),
        404: {$ref: 'HttpError'},
      }
    }
  }, async (request, reply) => {
    const { id } = request.params
    await prisma.product.delete({
      where: { id }
    }).catch((error) => {
      throw httpErrors.notFound('Product not found')
    })
    await redis.del(`product:${id}`) // Invalidate cache for the specific product
    await redis.del(cacheKey) // Invalidate cache
    reply.code(204)
  })
}

export default product
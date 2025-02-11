import {type FastifyInstance} from 'fastify'
import fp from 'fastify-plugin'
import FastifySwagger from '@fastify/swagger'
import swagger from '@fastify/swagger-ui'

import {SwaggerTheme, SwaggerThemeNameEnum} from 'swagger-themes'

const theme = new SwaggerTheme()
const darkStyle = theme.getBuffer(SwaggerThemeNameEnum.DARK)

export default fp(
  async function (fastify: FastifyInstance): Promise<void> {
    // Set up @fastify/swagger
    await fastify.register(FastifySwagger)
    const routePrefix = '/documentation'
    await fastify.register(swagger, {
      routePrefix,
      theme: {
        css: [{filename: 'theme.css', content: darkStyle}],
      },
    })
  },
  {
    fastify: '5.x',
    name: 'swagger',
  },
)

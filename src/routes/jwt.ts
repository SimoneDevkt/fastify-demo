import {type FastifyPluginAsyncTypebox, Type} from '@fastify/type-provider-typebox'

const jwt: FastifyPluginAsyncTypebox = async function (fastify) {
  const { httpErrors } = fastify

  const signupSchema = {
    body: Type.Object({
      username: Type.String(),
      password: Type.String()
    })
  }

  await fastify.post('/signup', { schema: signupSchema }, async (req, reply) => {
    const { username, password } = req.body;
    // some code
    if (username === 'admin' && password === 'admin') {
      const token = fastify.sign(username);
      return { token };
    }

    throw httpErrors.unauthorized();
  })

}

export default jwt;

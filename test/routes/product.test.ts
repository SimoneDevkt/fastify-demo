import test, {after, before} from 'node:test'
import * as assert from 'node:assert'
import { getServer } from '../helper.ts'
import type { FastifyInstance } from 'fastify'

let server: FastifyInstance
before(async () => {
  server = await getServer()
})

after(async () => {
  await server.close()
})

test('get products route', async (t) => {
  const res = await server.inject({
    method: 'GET',
    url: '/products',
  })
  assert.strictEqual(res.statusCode, 200)
})

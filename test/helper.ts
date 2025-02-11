import Fastify from 'fastify'
import {app, options} from '../src/app.ts'

import {PrismaClient} from '@prisma/client'
import {execSync} from 'child_process'

import { mock } from 'node:test';
import type { FastifyRedis } from '@fastify/redis';
const mockRedis = {
  get: mock.fn(),
  set: mock.fn(),
  del: mock.fn(),
}

let counter = 0

const prismaInit = new PrismaClient()

export async function getPrisma(preSeed = true) {
  const newDB = `t_${process.pid}_${counter++}`
  await prismaInit.$queryRawUnsafe(`CREATE DATABASE ${newDB}`)

  const connectionString = process.env.DATABASE_URL?.replace(/\/[a-zA-Z0-9\-_]+$/, '/' + newDB)
  execSync(`npx prisma migrate deploy ${preSeed ? '&& npx prisma db execute --file ./test/testdata.sql' : ''}`, {
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
    },
    stdio: 'ignore',
    // Use utf8 encoding for stdio pipes
    encoding: 'utf8',
  })

  const prisma = new PrismaClient({
    datasourceUrl: connectionString,
  })

  const stopPrisma = async () => {
    await prisma.$disconnect()
    await prismaInit.$queryRawUnsafe(`DROP DATABASE ${newDB} WITH (FORCE)`)
  }

  return {
    prisma,
    connectionString,
    stopPrisma,
  }
}

export async function getServer() {
  
  const {connectionString, stopPrisma} = await getPrisma()

  // Add your config customizations here
  const fastify = Fastify({
    ...options,
  })
  //create env for testing
  fastify.decorate('config', {
    DATABASE_URL: connectionString,
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'secret'
  } as never)

  // Mock the redis client
  fastify.addHook('onReady', async () => {
    fastify.redis = mockRedis as unknown as FastifyRedis
  })
  
  fastify.addHook('preClose', async () => {
    await stopPrisma()
  })

  await fastify.register(app) // buildServer(config)

  return fastify
}

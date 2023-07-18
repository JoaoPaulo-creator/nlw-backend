import * as dotenv from 'dotenv'
import app from '../src/server'

// Require the framework
import Fastify from 'fastify'

dotenv.config()

const teste: any = app

// Instantiate Fastify with some config
const server = Fastify({
  logger: false,
})

// Register your application as a normal plugin.
server.register(teste, {
  prefix: '/',
})

export default async (req: any, res: any) => {
  await server.ready()
  server.server.emit('request', req, res)
}

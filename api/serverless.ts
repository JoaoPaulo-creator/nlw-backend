import * as dotenv from 'dotenv'
import cors from '@fastify/cors'
import { auth } from '../src/routes/auth'
import { routes } from '../src/routes/memories'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { upload } from '../src/routes/upload'
import { resolve } from 'path'

// import app from '../src/app'

// Require the framework
import fastify from 'fastify'

dotenv.config()
const app = fastify()
app.register(routes)

app.register(multipart)
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: `${process.env.JWT_SECRET}`,
})

app.register(upload)
app.register(auth)

export default async (req: any, res: any) => {
  await app.ready()
  app.server.emit('request', req, res)
}

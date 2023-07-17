import fastify from 'fastify'
import cors from '@fastify/cors'
import { routes } from './routes/memories'
import 'dotenv/config'
import { auth } from './routes/auth'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { upload } from './routes/upload'
import { resolve } from 'path'

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

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('🚀 Server listening on port http://localhost:3333')
  })

export default app

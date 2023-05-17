import fastify from 'fastify'
import cors from '@fastify/cors'
import { routes } from './routes/memories'

const app = fastify()
app.register(routes)
app.register(cors, {
  origin: true,
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('🚀 Server listening on port http://localhost:3333')
  })

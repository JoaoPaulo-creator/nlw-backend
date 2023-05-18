import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import z from 'zod'
import { REPLServer } from 'repl'

export async function routes(app: FastifyInstance) {

  /*
   funciona mais ou menos como um middleware
   entao antes de qualquer requisicao, sera verificado se o usuario esta logado
   ou se o token valido
  */
  app.addHook('preHandler',async (request) => {
    await request.jwtVerify()
  })


  app.get('/memories', async (request) => {

    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      // retornando apenas algumas das linhas de texto, salvas na memoria.
      // do jeito que esta, é retornado um objeto mais leve, pois contém no maximo
      // 115 caracteres.
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request, reply) => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if(!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  app.post('/memories', async (request, reply) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })

    return reply.code(201).send(memory)
  })

  app.put('/memories/:id', async (request, reply) => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { id } = paramSchema.parse(request.params)
    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if(memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      where: { id },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request, reply): Promise<void> => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramSchema.parse(request.params)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if(memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }


    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}

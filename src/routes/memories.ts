import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import z from 'zod'

export async function routes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
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

  app.get('/memories/:id', async (request) => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramSchema.parse(request.params)
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

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
        userId: 'b8cf27b4-8fe9-41c4-9e93-8aea08f4b82b',
      },
    })

    return reply.code(201).send(memory)
  })

  app.put('/memories/:id', async (request) => {
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
    await prisma.memory.update({
      where: { id },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })
  })

  app.delete('/memories/:id', async (request): Promise<void> => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramSchema.parse(request.params)
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}

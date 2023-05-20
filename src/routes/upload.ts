import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

/*
pipline permite o processo de um stream (le-se processo de upload, neste caso), finalizar
*/

const pump = promisify(pipeline)

export async function upload(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fields: 5_242_880, // file size limit of 5 MB
      },
    })

    if (!upload) {
      return reply.code(400).send()
    }

    const mimetypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimetypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) {
      return reply.code(400).send()
    }

    const fileId = randomUUID() // gerando um id unico para o arquivo
    const fileExtension = extname(upload.filename) // pegando a extensão do arquivo
    const fileName = fileId.concat(fileExtension) // salvando o nome do arquivo com o id + extensão

    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads', fileName), // salvando o arquivo no diretório de uploads que fica na raiz do projeto
    )

    await pump(upload.file, writeStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()
    return { fileUrl }
  })
}

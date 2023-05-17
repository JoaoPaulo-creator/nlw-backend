import assert from 'node:assert'
import { describe, it } from 'node:test'

describe('Create memory', () => {
  it('should create a memory', async () => {
    const memory = await fetch('http://localhost:3333/memories', {
      method: 'POST',
      body: JSON.stringify({
        content: 'test',
        coverUrl: 'https://avatars.githubusercontent.com/u/79981086?v=4',
        isPublic: 1,
      }),
    })

    assert.strictEqual(201, memory.status)
  })
})

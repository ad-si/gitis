import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import logIssue from '../source/logIssue.js'

describe('logIssue', () => {
  const originalInfo = console.info
  let output: string[] = []

  beforeEach(() => {
    output = []
    console.info = (message: string) => {
      output.push(message)
    }
  })

  afterEach(() => {
    console.info = originalInfo
  })

  it('prints the formatted datetime followed by the title', () => {
    logIssue({
      title: 'Fix the login bug',
      datetime: new Date('2024-03-14T15:09:00Z'),
    })

    assert.deepEqual(output, ['2024-03-14 15:09:00.000: Fix the login bug'])
  })

  it('prints just a colon prefix when no datetime is set', () => {
    logIssue({ title: 'No date here' })

    assert.deepEqual(output, [': No date here'])
  })
})

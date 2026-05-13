import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import parseIssueDate from '../source/parseIssueDate.js'

describe('parseIssueDate', () => {
  it('parses a well-formed filename stem', () => {
    const date = parseIssueDate('2016-05-31T0759')
    assert.equal(date.toISOString(), '2016-05-31T07:59:00.000Z')
  })

  it('parses midnight correctly', () => {
    const date = parseIssueDate('2020-01-01T0000')
    assert.equal(date.toISOString(), '2020-01-01T00:00:00.000Z')
  })

  it('returns Invalid Date for an unrecognized format', () => {
    const date = parseIssueDate('not-a-date')
    assert.ok(Number.isNaN(date.getTime()))
  })

  it('returns Invalid Date when the colon separator is present', () => {
    // The filename format intentionally omits the colon between hour and minute.
    const date = parseIssueDate('2016-05-31T07:59')
    assert.ok(Number.isNaN(date.getTime()))
  })

  it('returns Invalid Date for an empty string', () => {
    const date = parseIssueDate('')
    assert.ok(Number.isNaN(date.getTime()))
  })
})

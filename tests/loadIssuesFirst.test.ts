import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

import loadIssuesFirst, {
  type FilePayload,
} from '../source/loadIssuesFirst.js'

const makeFile = (path: string, content: string): Promise<FilePayload> =>
  Promise.resolve({ path, content })

describe('loadIssuesFirst', () => {
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

  it('defaults missing state to "open" and respects state filter', async () => {
    await loadIssuesFirst({
      filePromises: [
        makeFile('2020-01-01T0000.yaml', 'title: Open ticket\n'),
        makeFile(
          '2020-01-02T0000.yaml',
          'title: Closed ticket\nstate: closed\n',
        ),
      ],
      filters: [{ name: 'state', value: 'open' }],
      sortBy: 'datetime',
      sortOrder: 'ascending',
    })

    assert.deepEqual(output, ['2020-01-01 00:00:00.000: Open ticket'])
  })

  it('sorts by datetime ascending', async () => {
    await loadIssuesFirst({
      filePromises: [
        makeFile('2020-03-01T0000.yaml', 'title: Third\n'),
        makeFile('2020-01-01T0000.yaml', 'title: First\n'),
        makeFile('2020-02-01T0000.yaml', 'title: Second\n'),
      ],
      filters: [],
      sortBy: 'datetime',
      sortOrder: 'ascending',
    })

    assert.deepEqual(output, [
      '2020-01-01 00:00:00.000: First',
      '2020-02-01 00:00:00.000: Second',
      '2020-03-01 00:00:00.000: Third',
    ])
  })

  it('sorts by datetime descending', async () => {
    await loadIssuesFirst({
      filePromises: [
        makeFile('2020-01-01T0000.yaml', 'title: First\n'),
        makeFile('2020-03-01T0000.yaml', 'title: Third\n'),
        makeFile('2020-02-01T0000.yaml', 'title: Second\n'),
      ],
      filters: [],
      sortBy: 'datetime',
      sortOrder: 'descending',
    })

    assert.deepEqual(output, [
      '2020-03-01 00:00:00.000: Third',
      '2020-02-01 00:00:00.000: Second',
      '2020-01-01 00:00:00.000: First',
    ])
  })

  it('sorts by a string field using locale comparison', async () => {
    await loadIssuesFirst({
      filePromises: [
        makeFile('2020-01-01T0000.yaml', 'title: Charlie\n'),
        makeFile('2020-01-02T0000.yaml', 'title: Alpha\n'),
        makeFile('2020-01-03T0000.yaml', 'title: Bravo\n'),
      ],
      filters: [],
      sortBy: 'title',
      sortOrder: 'ascending',
    })

    assert.deepEqual(output, [
      '2020-01-02 00:00:00.000: Alpha',
      '2020-01-03 00:00:00.000: Bravo',
      '2020-01-01 00:00:00.000: Charlie',
    ])
  })

  it('applies multiple filters conjunctively', async () => {
    await loadIssuesFirst({
      filePromises: [
        makeFile(
          '2020-01-01T0000.yaml',
          'title: Match\nstate: open\npriority: high\n',
        ),
        makeFile(
          '2020-01-02T0000.yaml',
          'title: Wrong priority\nstate: open\npriority: low\n',
        ),
        makeFile(
          '2020-01-03T0000.yaml',
          'title: Wrong state\nstate: closed\npriority: high\n',
        ),
      ],
      filters: [
        { name: 'state', value: 'open' },
        { name: 'priority', value: 'high' },
      ],
      sortBy: 'datetime',
      sortOrder: 'ascending',
    })

    assert.deepEqual(output, ['2020-01-01 00:00:00.000: Match'])
  })

  it('emits nothing when every issue is filtered out', async () => {
    await loadIssuesFirst({
      filePromises: [
        makeFile('2020-01-01T0000.yaml', 'title: A\nstate: closed\n'),
      ],
      filters: [{ name: 'state', value: 'open' }],
      sortBy: 'datetime',
      sortOrder: 'ascending',
    })

    assert.deepEqual(output, [])
  })

  it('throws for an unsupported sort order', async () => {
    await assert.rejects(
      loadIssuesFirst({
        filePromises: [
          makeFile('2020-01-01T0000.yaml', 'title: A\n'),
          makeFile('2020-01-02T0000.yaml', 'title: B\n'),
        ],
        filters: [],
        sortBy: 'datetime',
        // deliberately invalid value to exercise the error branch
        sortOrder: 'sideways' as unknown as 'ascending',
      }),
      /sideways is no supported sorting order/,
    )
  })
})

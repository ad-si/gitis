import path from 'node:path'

import yaml from 'js-yaml'

import logIssue, { type Issue } from './logIssue.js'
import parseIssueDate from './parseIssueDate.js'

export interface FilePayload {
  path: string
  content: string
  issue?: Issue
}

export interface Filter {
  name: string
  value: unknown
}

export interface LoadIssuesFirstOptions {
  filePromises: Promise<FilePayload>[]
  filters: Filter[]
  sortBy: string
  sortOrder: 'ascending' | 'descending'
}

export default async function loadIssuesFirst(
  options: LoadIssuesFirstOptions,
): Promise<void> {
  const { filePromises, filters, sortBy, sortOrder } = options

  const files = await Promise.all(filePromises)

  files
    .map(file => {
      file.issue = yaml.load(file.content) as Issue
      return file
    })
    .map(file => {
      const issue = file.issue!
      issue.datetime = parseIssueDate(
        path.basename(file.path, path.extname(file.path)),
      )
      if (!issue.state) issue.state = 'open'
      return file
    })
    .filter(file =>
      filters.every(filter => file.issue![filter.name] === filter.value),
    )
    .sort((fileA, fileB) => {
      const issueA = fileA.issue!
      const issueB = fileB.issue!

      let sortValueA = issueA[sortBy] as number | string
      let sortValueB = issueB[sortBy] as number | string
      let value: number | undefined

      if (typeof sortValueA === 'number') {
        if (typeof sortValueB !== 'number') {
          sortValueB = Number(sortValueB)
        }
        else {
          value = sortValueA - sortValueB
        }
      }
      else {
        if (typeof sortValueB === 'number') {
          sortValueA = Number(sortValueA)
        }
        else {
          value = String(sortValueA).localeCompare(String(sortValueB))
        }
      }

      if (value === undefined) return 0

      if (sortOrder === 'ascending') {
        return value
      }
      else if (sortOrder === 'descending') {
        return -value
      }
      else {
        throw new Error(`${sortOrder} is no supported sorting order`)
      }
    })
    .forEach(file => logIssue(file.issue!))
}

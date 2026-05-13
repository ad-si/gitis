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

      const rawA = issueA[sortBy]
      const rawB = issueB[sortBy]
      let value: number

      if (rawA instanceof Date && rawB instanceof Date) {
        value = rawA.getTime() - rawB.getTime()
      }
      else if (typeof rawA === 'number' && typeof rawB === 'number') {
        value = rawA - rawB
      }
      else {
        value = String(rawA).localeCompare(String(rawB))
      }

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

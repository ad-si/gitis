import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'

import yaml from 'js-yaml'
import nconf from 'nconf'
import yargs from 'yargs'

import loadIssuesFirst, {
  type FilePayload,
  type Filter,
} from './loadIssuesFirst.js'
import logIssue, { type Issue } from './logIssue.js'
import parseIssueDate from './parseIssueDate.js'

const cliOptions = {
  sortBy: {
    default: 'datetime',
  },
  sortOrder: {
    default: 'ascending',
    choices: ['ascending', 'descending'] as const,
  },
  state: {
    default: 'open',
    choices: ['open', 'closed'] as const,
  },
  help: {
    alias: 'h',
  },
}

export default async function gitis(cliArguments: string[]): Promise<void> {
  const options = await yargs(cliArguments)
    .usage('Usage: $0 <project-directory>')
    .version()
    .options(cliOptions)
    .help()
    .parse()

  nconf
    .argv(cliOptions as never)
    .env()
    .file(path.join(process.cwd(), '.gitisrc'))

  const issuesPath = path.join(
    options._[0] ? path.resolve(String(options._[0])) : process.cwd(),
    'issues',
  )
  const filters: Filter[] = [
    {
      name: 'state',
      value: nconf.get('state'),
    },
  ]

  try {
    const filePaths = await readdir(issuesPath)
    const yamlFiles = filePaths.filter(filePath => /\.yaml$/.test(filePath))

    const filePromises: Promise<FilePayload>[] = yamlFiles.map(filePath =>
      readFile(path.join(issuesPath, filePath), 'utf8').then(fileContent => ({
        path: filePath,
        content: fileContent,
      })),
    )

    if (options.state) {
      await loadIssuesFirst({
        filePromises,
        filters,
        sortBy: nconf.get('sortBy'),
        sortOrder: nconf.get('sortOrder'),
      })
    }
    else {
      await filePromises.reduce<Promise<void>>(
        (promiseChain, filePromise, fileIndex) =>
          promiseChain
            .then(() => filePromise)
            .then(file => {
              const issueJson = yaml.load(file.content) as Issue

              issueJson.datetime = parseIssueDate(
                path.basename(
                  yamlFiles[fileIndex]!,
                  path.extname(yamlFiles[fileIndex]!),
                ),
              )
              if (!issueJson.state) issueJson.state = 'open'

              const isFilteredOut = filters.some(
                filter => issueJson[filter.name] !== filter.value,
              )

              if (!isFilteredOut) logIssue(issueJson)
            }),
        Promise.resolve(),
      )
    }
  }
  catch (error) {
    console.error(error instanceof Error ? error.stack : error)
  }
}

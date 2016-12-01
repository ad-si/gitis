import path from 'path'

import fsp from 'fs-promise'
import yaml from 'js-yaml'
import nconf from 'nconf'
import yargs from 'yargs'
import momentFromString from '@datatypes/moment'
import loadIssuesFirst from './loadIssuesFirst'
import logIssue from './logIssue'


const cliOptions = {
  sortBy: {
    default: 'datetime',
  },
  sortOrder: {
    default: 'ascending',
    choices: ['ascending', 'descending'],
  },
  state: {
    default: 'open',
    choices: ['open', 'closed'],
  },
  help: {
    alias: 'h',
  },
}



export default (cliArguments) => {
  const options = yargs
    .usage('Usage: $0 <project-directory>')
    .version()
    .options(cliOptions)
    .help()
    .parse(cliArguments)

  nconf
    .argv(cliOptions)
    .env()
    .file(path.join(process.cwd(), '.gitisrc'))

  const issuesPath = path.join(
    options._[0]
      ? path.resolve(options._[0])
      : process.cwd(),
    'issues'
  )
  const filters = [
    {
      name: 'state',
      value: nconf.get('state'),
    },
  ]

  return fsp
    .readdir(issuesPath)
    .then(filePaths => filePaths.filter(filePath => /\.yaml$/.test(filePath)))
    .then(yamlFiles => {
      const filePromises = yamlFiles
        .map(filePath => fsp
          .readFile(path.join(issuesPath, filePath), 'utf8')
          .then(fileContent => ({
            path: filePath,
            content: fileContent,
          }))
        )

      if (options.state) {
        return loadIssuesFirst({
          filePromises,
          filters,
          sortBy: nconf.get('sortBy'),
          sortOrder: nconf.get('sortOrder'),
        })
      }
      else {
        return filePromises.reduce(
          (promiseChain, filePromise, fileIndex) => {
            return promiseChain
              .then(() => filePromise)
              .then(file => {
                const issueJson = yaml.safeLoad(file.content)

                issueJson.datetime = momentFromString(path.basename(
                  yamlFiles[fileIndex],
                  path.extname(yamlFiles[fileIndex])
                ))
                if (!issueJson.state) issueJson.state = 'open'

                const isFilteredOut = filters.some(
                  filter => issueJson[filter.name] !== filter.value
                )

                if (!isFilteredOut) logIssue(issueJson)
              })
          },
          Promise.resolve()
        )
      }
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
    })
}

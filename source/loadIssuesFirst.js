import path from 'path'

import yaml from 'js-yaml'
import momentFromString from '@datatypes/moment'

import logIssue from './logIssue'


export default (options = {}) => {
  const {
    filePromises,
    filters,
    sortBy,
    sortOrder,
  } = options

  return Promise
    .all(filePromises)
    .then(files => {
      return files
        .map(file => {
          file.issue = yaml.safeLoad(file.content)
          return file
        })
        .map(file => {
          file.issue.datetime = momentFromString(path.basename(
            file.path,
            path.extname(file.path)
          ))
          if (!file.issue.state) file.issue.state = 'open'
          return file
        })
        .filter(file => filters
          .every(filter => file.issue[filter.name] === filter.value)
        )
        .sort((fileA, fileB) => {
          const issueA = fileA.issue
          const issueB = fileB.issue

          let sortValueA = issueA[sortBy]
          let sortValueB = issueB[sortBy]
          let value

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
              value = String(sortValueA)
                .localeCompare(String(sortValueB))
            }
          }

          if (sortOrder === 'ascending') {
            return value
          }
          else if (sortOrder === 'descending') {
            return -value
          }
          else {
            throw new Error(
              sortOrder + ' is no supported sorting order'
            )
          }
        })
        .forEach(file => logIssue(file.issue))
    })
}

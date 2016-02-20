import path from 'path'

import fsp from 'fs-promise'
import yaml from 'js-yaml'
import nconf from 'nconf'
import yargs from 'yargs'

const cliOptions = {
	sortBy: {
		default: 'number'
	},
	sortOrder: {
		default: 'ascending',
		choices: ['ascending', 'descending']
	},
	state: {
		default: 'open',
		choices: ['open', 'closed']
	},
	help: {
		alias: 'h'
	}
}

const argv = yargs
	.usage('Usage: $0 <project-directory>')
	.version()
	.options(cliOptions)
	.help()
	.argv

nconf
	.argv(cliOptions)
	.env()
	.file(path.join(process.cwd(), '.gitisrc'))

const issuesPath = path.join(path.resolve(argv._[0] || '.'), 'issues')

const filters = [
	{
		name: 'state',
		value: nconf.get('state')
	}
]

fsp
	.readdir(issuesPath)
	.then(filePaths => {

		filePaths = filePaths.filter(filePath => /\.yaml$/.test(filePath))

		return Promise
			.all(filePaths.map(filePath =>
				fsp.readFile(path.join(issuesPath, filePath), 'utf8')
			))
			.then(files => {
				files
					.map(file => yaml.safeLoad(file))
					.map((json, index) => {
						json.number = path.basename(
							filePaths[index],
							path.extname(filePaths[index])
						)
						return json
					})
					.filter(issue =>
						filters.every(filter =>
							issue[filter.name] === filter.value)
					)
					.sort((issueA, issueB) => {
						let sortBy = nconf.get('sortBy')
						let sortOrder = nconf.get('sortOrder')
						let sortValueA = issueA[sortBy]
						let sortValueB = issueB[sortBy]
						let value

						if (typeof sortValueA === 'number') {
							if (typeof sortValueB !== 'number')
								sortValueB = Number(sortValueB)
							else
								value = sortValueA - sortValueB
						}
						else {
							if (typeof sortValueB === 'number')
								sortValueA = Number(sortValueA)
							else
								value = sortValueA.localeCompare(sortValueB)
						}

						if (sortOrder === 'ascending')
							return value
						else if (sortOrder === 'descending')
							return -value
						else
							throw new Error(
								sortOrder + ' is no supported sorting order'
							)
					})
					.forEach(json =>
						console.log(json.number + ': ' + json.title)
					)
			})
	})
	.catch(error => {
		console.error(error.stack)
	})

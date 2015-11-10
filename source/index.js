import path from 'path'

import fsp from 'fs-promise'
import yaml from 'js-yaml'

let issuesPath = path.join(process.cwd(), 'issues')

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
					.forEach(json =>
						console.log(json.number + ': ' + json.title)
					)
			})
	})
	.catch(error => {
		console.error(error.stack)
	})

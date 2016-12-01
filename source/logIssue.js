export default (issue) => {
  const dateString = String(issue.datetime)
    .replace('T', ' ')
    .replace('Z', '')

  // eslint-disable-next-line no-console
  console.info(`${dateString}: ${issue.title}`)
}

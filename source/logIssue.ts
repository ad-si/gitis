export interface Issue {
  title: string
  body?: string
  state?: string
  datetime?: Date
  [key: string]: unknown
}

export default function logIssue(issue: Issue): void {
  const dateString = issue.datetime
    ? issue.datetime.toISOString().replace('T', ' ').replace('Z', '')
    : ''

  console.info(`${dateString}: ${issue.title}`)
}

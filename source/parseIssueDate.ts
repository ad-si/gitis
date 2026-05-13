// Issue filenames use the format `YYYY-MM-DDTHHMM` (a near-ISO-8601 stamp
// without the colon between hour and minute), e.g. `2016-05-31T0759.yaml`.
export default function parseIssueDate(name: string): Date {
  const match = name.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})(\d{2})$/)
  if (!match) return new Date(NaN)
  return new Date(`${match[1]}T${match[2]}:${match[3]}:00Z`)
}

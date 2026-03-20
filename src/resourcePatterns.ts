/**
 * Convert a resource pattern from iam-data to a regex pattern.
 * Variables like `${BucketName}` become named capture groups.
 *
 * @param pattern - The IAM resource type ARN pattern (e.g. `arn:${Partition}:s3:::${BucketName}/${ObjectName}`)
 * @returns A regex string anchored with `^...$` that matches concrete ARNs against the pattern
 */
export function convertResourcePatternToRegex(pattern: string): string {
  const regex = pattern.replace(/\$\{.*?\}/g, (match) => {
    const name = match.substring(2, match.length - 1)
    const camelName = name.at(0)?.toLowerCase() + name.substring(1)
    return `(?<${camelName}>(.+?))`
  })
  return `^${regex}$`
}

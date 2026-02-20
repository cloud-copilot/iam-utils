/**
 * Convert an AWS wildcard ARN pattern (e.g. "arn:aws:s3:::bucket/*") into a RegExp.
 *
 * @param pattern The ARN pattern string with wildcards
 * @returns RegExp that matches ARNs according to the wildcard pattern
 */
export function resourceArnWithWildcardsToRegex(pattern: string): RegExp {
  const parts = pattern.split('*').map((s) => s.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&'))
  return new RegExp('^' + parts.join('.*?') + '$')
}

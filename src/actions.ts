/**
 * Checks to see if the action matches the provided IAM action pattern.
 *
 * @param action the action to check, should not contain wildcards
 * @param pattern the pattern to match against, may contain wildcards
 * @returns true if the action matches the pattern, false otherwise
 */
export function actionMatchesPattern(action: string, pattern: string): boolean {
  const unescapedAction = unescapeUnicodeCharacters(action)
  const unescapedPattern = unescapeUnicodeCharacters(pattern)

  // Full wildcard matches everything
  if (unescapedPattern === '*') {
    return true
  }

  // Split into service and action parts
  const patternColonIndex = unescapedPattern.indexOf(':')
  const actionColonIndex = unescapedAction.indexOf(':')

  // If pattern has no colon, it must match the entire action exactly (case-insensitive)
  if (patternColonIndex === -1) {
    if (actionColonIndex === -1) {
      return unescapedAction.toLowerCase() === unescapedPattern.toLowerCase()
    }
    return false
  }

  // If action has no colon but pattern does, no match
  if (actionColonIndex === -1) {
    return false
  }

  const patternService = unescapedPattern.substring(0, patternColonIndex)
  const patternAction = unescapedPattern.substring(patternColonIndex + 1)
  const actionService = unescapedAction.substring(0, actionColonIndex)
  const actionAction = unescapedAction.substring(actionColonIndex + 1)

  // Service must match exactly (case-insensitive), no wildcards allowed
  if (patternService.toLowerCase() !== actionService.toLowerCase()) {
    return false
  }

  // Match the action part with wildcards
  const regex = convertStringToPattern(patternAction)
  return regex.test(actionAction)
}

/**
 * Converts an action string pattern to a regular expression for matching.
 *
 * @param actionString the IAM action pattern string to convert
 * @returns RegExp that matches the pattern (case-insensitive)
 */
function convertStringToPattern(actionString: string): RegExp {
  const pattern = '^' + actionString.replace(/\?/g, '.').replace(/\*/g, '.*?') + '$'
  return new RegExp(pattern, 'i')
}

/**
 * Unescapes unicode characters in a string.
 *
 * @param str The string to unescape
 * @returns The string with any escaped unicode characters replaced with their actual characters
 */
function unescapeUnicodeCharacters(str: string): string {
  return str.replace(/\\u([\dA-Fa-f]{4})/gi, (match, code) => {
    return String.fromCharCode(parseInt(code, 16))
  })
}

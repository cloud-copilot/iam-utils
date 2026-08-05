import { splitArnParts } from './arn.js'

/** A character matcher used by the resource pattern compatibility automaton. */
type CharacterMatcher = 'any' | 'nonSeparator' | { char: string }

/** A transition through a resource pattern compatibility automaton. */
interface PatternTransition {
  /** The state reached after taking the transition. */
  nextState: number

  /** The character matcher consumed by the transition, or undefined for epsilon transitions. */
  consumes?: CharacterMatcher
}

/** A resource pattern automaton that accepts resource strings for one pattern language. */
interface PatternAutomaton {
  /** The accepting state for the automaton. */
  acceptingState: number

  /** Returns transitions available from the provided state. */
  transitions(state: number): PatternTransition[]
}

/** A token in a Service Authorization Reference resource type pattern. */
type ResourceTypeToken =
  | {
      /** A static literal character that must appear in the resource. */
      type: 'literal'
      /** The literal character to match. */
      value: string
    }
  | {
      /** A resource type variable such as `${BucketName}`. */
      type: 'variable'
      /** The set of characters this variable may match. */
      characterMatcher: CharacterMatcher
    }

/**
 * Checks whether a concrete resource ARN (possibly with wildcards) matches
 * a resource-type ARN pattern from the Service Authorization Reference.
 *
 * A wildcard resource string (`"*"`) always matches.
 *
 * This is a compatibility check: it returns true when there is at least one
 * concrete ARN that could satisfy both the resource string and the resource
 * type pattern. Resource type variables may span resource-component separators
 * such as `:` and `/`.
 *
 * @param resourceString - A concrete resource ARN or wildcard (`"*"`)
 * @param resourcePattern - An ARN pattern from iam-data (e.g. `arn:${Partition}:s3:::${BucketName}/${ObjectName}`)
 * @returns Whether the resource string matches the pattern
 */
export function resourceStringMatchesResourceTypePattern(
  resourceString: string,
  resourcePattern: string
): boolean {
  if (resourceString === '*') {
    return true
  }

  const resourceParts = splitArnParts(resourceString)
  const patternParts = splitArnParts(resourcePattern)

  if (
    !resourceComponentMatchesResourceTypeComponent(resourceParts.partition, patternParts.partition)
  ) {
    return false
  }

  if (!resourceComponentMatchesResourceTypeComponent(resourceParts.service, patternParts.service)) {
    return false
  }

  if (!resourceComponentMatchesResourceTypeComponent(resourceParts.region, patternParts.region)) {
    return false
  }

  if (
    !resourceComponentMatchesResourceTypeComponent(resourceParts.accountId, patternParts.accountId)
  ) {
    return false
  }

  return resourceComponentMatchesResourceTypeComponent(
    resourceParts.resource,
    patternParts.resource
  )
}

/**
 * Reduce resource type patterns to the most specific patterns that match a resource string.
 *
 * This helper does not know about iam-data or service-specific resource type ordering. It uses
 * the provided pattern set as context and removes matching parent patterns when a matching child
 * pattern has all of the parent's literal structure plus additional literal structure. Wildcard
 * resource strings preserve all matches because the wildcard may refer to parent and child resources.
 *
 * @param resourceString - A concrete resource ARN or wildcard (`"*"`)
 * @param resourcePatterns - Candidate resource type ARN patterns
 * @returns Matching resource type patterns with less-specific parent patterns removed, in input order
 */
export function mostSpecificMatchingResourceTypePatterns(
  resourceString: string,
  resourcePatterns: string[]
): string[] {
  const matchingPatterns = resourcePatterns.filter((pattern) =>
    resourceStringMatchesResourceTypePattern(resourceString, pattern)
  )

  if (resourceString.includes('*') || resourceString.includes('?')) {
    return matchingPatterns
  }

  return matchingPatterns.filter((candidatePattern, candidateIndex) => {
    return !matchingPatterns.some((otherPattern, otherIndex) => {
      return (
        otherIndex !== candidateIndex &&
        resourceTypePatternIsMoreSpecific(otherPattern, candidatePattern)
      )
    })
  })
}

/**
 * Check whether one resource type pattern is more specific than another.
 *
 * @param possibleChildPattern - The pattern that may be more specific
 * @param possibleParentPattern - The pattern that may be less specific
 * @returns Whether the possible child has all parent literal structure plus more literal structure
 */
function resourceTypePatternIsMoreSpecific(
  possibleChildPattern: string,
  possibleParentPattern: string
): boolean {
  const childLiteralText = literalTextFromResourceTypePattern(possibleChildPattern)
  const parentLiteralText = literalTextFromResourceTypePattern(possibleParentPattern)

  return (
    childLiteralText.length > parentLiteralText.length &&
    childLiteralText.startsWith(parentLiteralText)
  )
}

/**
 * Extract the literal text from a resource type pattern by removing variable placeholders.
 *
 * @param pattern - The resource type pattern to inspect
 * @returns Literal pattern text without `${Variable}` placeholders
 */
function literalTextFromResourceTypePattern(pattern: string): string {
  return tokenizeResourceTypePattern(pattern)
    .filter((token) => token.type === 'literal')
    .map((token) => token.value)
    .join('')
}

/**
 * Check whether a resource string component is compatible with a resource type pattern component.
 *
 * @param resourceComponent - The component value from the concrete or wildcard ARN
 * @param resourceTypeComponent - The component value from the resource type pattern ARN
 * @returns Whether at least one concrete component can satisfy both component patterns
 */
function resourceComponentMatchesResourceTypeComponent(
  resourceComponent: string | undefined,
  resourceTypeComponent: string | undefined
): boolean {
  if (resourceTypeComponent === '*') {
    return true
  }

  if (resourceComponent === undefined || resourceTypeComponent === undefined) {
    return false
  }

  if (resourceComponent === '' || resourceTypeComponent === '') {
    return (
      resourceComponent.localeCompare(resourceTypeComponent, undefined, {
        sensitivity: 'accent'
      }) === 0
    )
  }

  return patternsHaveIntersection(
    createResourceStringAutomaton(resourceComponent),
    createResourceTypePatternAutomaton(resourceTypeComponent)
  )
}

/**
 * Check whether two resource pattern automata accept at least one common string.
 *
 * @param first - The first pattern automaton to compare
 * @param second - The second pattern automaton to compare
 * @returns Whether the pattern languages have a non-empty intersection
 */
function patternsHaveIntersection(first: PatternAutomaton, second: PatternAutomaton): boolean {
  const visited = new Set<string>()
  const queue: [number, number][] = [[0, 0]]

  while (queue.length > 0) {
    const [firstState, secondState] = queue.shift()!
    const key = `${firstState}:${secondState}`
    if (visited.has(key)) {
      continue
    }
    visited.add(key)

    if (firstState === first.acceptingState && secondState === second.acceptingState) {
      return true
    }

    const firstTransitions = first.transitions(firstState)
    const secondTransitions = second.transitions(secondState)

    for (const transition of firstTransitions) {
      if (!transition.consumes) {
        queue.push([transition.nextState, secondState])
      }
    }

    for (const transition of secondTransitions) {
      if (!transition.consumes) {
        queue.push([firstState, transition.nextState])
      }
    }

    for (const firstTransition of firstTransitions) {
      if (!firstTransition.consumes) {
        continue
      }

      for (const secondTransition of secondTransitions) {
        if (!secondTransition.consumes) {
          continue
        }

        if (characterMatchersIntersect(firstTransition.consumes, secondTransition.consumes)) {
          queue.push([firstTransition.nextState, secondTransition.nextState])
        }
      }
    }
  }

  return false
}

/**
 * Create an automaton for a resource string that may contain IAM wildcards.
 *
 * @param resourceString - The resource string component to convert
 * @returns An automaton accepting concrete strings matched by the resource string
 */
function createResourceStringAutomaton(resourceString: string): PatternAutomaton {
  const chars = [...resourceString]
  return {
    acceptingState: chars.length,
    transitions(state: number): PatternTransition[] {
      if (state >= chars.length) {
        return []
      }

      const char = chars[state]
      if (char === '*') {
        return [{ nextState: state + 1 }, { nextState: state, consumes: 'any' }]
      }
      if (char === '?') {
        return [{ nextState: state + 1, consumes: 'any' }]
      }
      return [{ nextState: state + 1, consumes: { char } }]
    }
  }
}

/**
 * Create an automaton for a Service Authorization Reference resource type component.
 *
 * @param resourceTypePattern - The resource type component to convert
 * @returns An automaton accepting concrete strings matched by the resource type component
 */
function createResourceTypePatternAutomaton(resourceTypePattern: string): PatternAutomaton {
  const tokens = tokenizeResourceTypePattern(resourceTypePattern)
  return {
    acceptingState: tokens.length,
    transitions(state: number): PatternTransition[] {
      if (state >= tokens.length) {
        return []
      }

      const token = tokens[state]
      if (token.type === 'variable') {
        return [
          { nextState: state, consumes: token.characterMatcher },
          { nextState: state + 1, consumes: token.characterMatcher }
        ]
      }
      return [{ nextState: state + 1, consumes: { char: token.value } }]
    }
  }
}

/**
 * Tokenize a Service Authorization Reference resource type pattern.
 *
 * @param pattern - The resource type pattern component to tokenize
 * @returns Tokens representing literals and `${Variable}` placeholders
 */
function tokenizeResourceTypePattern(pattern: string): ResourceTypeToken[] {
  const tokens: ResourceTypeToken[] = []
  const variableMatches = [...pattern.matchAll(/\$\{[0-9a-zA-Z]+\}/g)]
  const patternIsSingleVariable = variableMatches.length === 1 && variableMatches[0]![0] === pattern

  for (let i = 0; i < pattern.length;) {
    if (pattern[i] === '$' && pattern[i + 1] === '{') {
      const endIndex = pattern.indexOf('}', i + 2)
      if (endIndex !== -1) {
        tokens.push({
          type: 'variable',
          characterMatcher: patternIsSingleVariable ? 'nonSeparator' : 'any'
        })
        i = endIndex + 1
        continue
      }
    }

    tokens.push({ type: 'literal', value: pattern[i] })
    i++
  }
  return tokens
}

/**
 * Check whether two character matchers can consume the same character.
 *
 * @param first - The first character matcher
 * @param second - The second character matcher
 * @returns Whether the matchers have a non-empty intersection
 */
function characterMatchersIntersect(first: CharacterMatcher, second: CharacterMatcher): boolean {
  if (first === 'any' || second === 'any') {
    return true
  }

  if (first === 'nonSeparator' && second === 'nonSeparator') {
    return true
  }

  if (first === 'nonSeparator') {
    return typeof second === 'object' && !isResourceComponentSeparator(second.char)
  }

  if (second === 'nonSeparator') {
    return typeof first === 'object' && !isResourceComponentSeparator(first.char)
  }

  return first.char.localeCompare(second.char, undefined, { sensitivity: 'accent' }) === 0
}

/**
 * Check whether a character is a resource component separator.
 *
 * @param char - The character to check
 * @returns Whether the character separates resource component segments
 */
function isResourceComponentSeparator(char: string): boolean {
  return char === ':' || char === '/'
}

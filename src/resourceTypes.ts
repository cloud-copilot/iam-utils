import { splitArnParts } from './arn.js'
import { convertResourcePatternToRegex } from './resourcePatterns.js'

/**
 * Checks whether a concrete resource ARN (possibly with wildcards) matches
 * a resource-type ARN pattern from the Service Authorization Reference.
 *
 * A wildcard resource string (`"*"`) always matches.
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

  const [resourceResourcePartsSegments, resourceResourceParts] = splitResourceTypeComponent(
    resourceParts.resource
  )
  const [patternResourcePartsSegments, patternResourceParts] = splitResourceTypeComponent(
    patternParts.resource
  )

  // If there are more segments in the resource than the pattern, it cannot match,
  // unless the final pattern component is a variable (e.g. ${ObjectName}) which
  // can span multiple segments (like S3 object keys with slashes).
  if (resourceResourcePartsSegments > patternResourcePartsSegments) {
    const lastPatternComponent = patternResourceParts.at(-1)
    if (!isResourceTypeVariable(lastPatternComponent) || patternResourcePartsSegments === 1) {
      return false
    }
  }

  // If there are fewer segments with contents in the resource than the pattern, and the last segment of the resource
  // does not end with a wildcard, it cannot match
  if (
    resourceResourceParts.length < patternResourceParts.length &&
    !resourceResourceParts.at(-1)?.endsWith('*')
  ) {
    return false
  }

  const compareLen = Math.min(resourceResourceParts.length, patternResourceParts.length)
  for (let i = 0; i < compareLen; i++) {
    const resourceComponent = resourceResourceParts[i]
    const isLastPattern = i === patternResourceParts.length - 1
    const patternComponent = patternResourceParts[i]

    if (!patternComponent) {
      return false
    }

    if (isResourceTypeVariable(patternComponent)) {
      if (
        isLastPattern &&
        resourceResourcePartsSegments > patternResourcePartsSegments &&
        patternResourcePartsSegments > 1
      ) {
        // Variable at the end can absorb additional segments.
        return true
      }
      if (isLastPattern && resourceComponent?.endsWith('*')) {
        // If the resource component ends with a wildcard, it matches everything after
        break
      }

      // These match anything, move along.
      continue
    }

    if (!resourceComponent) {
      return false
    }

    const resourceComponentPattern =
      '^' + resourceComponent.replace(/\?/g, '.').replace(/\*/g, '.*?') + '$'
    const regex = new RegExp(resourceComponentPattern)
    const match = patternComponent.match(regex)
    if (match) {
      if (isLastPattern && resourceComponent.endsWith('*')) {
        // If the resource component ends with a wildcard, it matches everything after
        break
      }
      continue
    } else {
      return false
    }
  }

  return true
}

/**
 * Split a resource component on colons and slashes into its segments.
 *
 * @param component - The resource portion of an ARN
 * @returns A tuple of [total segment count, non-empty segments]
 */
function splitResourceTypeComponent(component: string | undefined): [number, string[]] {
  const parts = component?.split(/[:/]/) ?? []
  return [parts.length, parts.filter((p) => p && p !== '')]
}

/**
 * Check whether a single ARN component from a resource string matches
 * the corresponding component from a resource-type pattern.
 *
 * @param resourceComponent - The component value from the concrete ARN
 * @param resourceTypeComponent - The component value from the pattern ARN
 * @returns Whether the resource component matches the pattern component
 */
function resourceComponentMatchesResourceTypeComponent(
  resourceComponent: string | undefined,
  resourceTypeComponent: string | undefined
): boolean {
  if (resourceTypeComponent === '*' || resourceTypeComponent === resourceComponent) {
    return true
  }

  if (!resourceComponent || !resourceTypeComponent) {
    return false
  }

  if (isResourceTypeVariable(resourceTypeComponent)) {
    // If the entire component is a single variable, it matches anything
    return true
  }

  const pattern = convertResourcePatternToRegex(resourceTypeComponent)
  const regex = new RegExp(pattern)
  const match = resourceComponent.match(regex)
  return !!match
}

/**
 * Check whether a pattern component is a single IAM variable placeholder (e.g. `${BucketName}`).
 *
 * @param component - The component string to check
 * @returns Whether the component is a variable placeholder
 */
function isResourceTypeVariable(component: string | undefined): boolean {
  if (!component) {
    return false
  }
  return component.match(/^\$\{[0-9a-zA-Z]+\}$/) !== null
}

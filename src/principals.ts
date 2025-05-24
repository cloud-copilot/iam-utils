import { splitArnParts } from './arn.js'

/**
 * Transform an assumed role session ARN into a role ARN
 *
 * @param assumedRoleArn the assumed role session ARN
 * @returns the role ARN for the assumed role session
 */
export function convertAssumedRoleArnToRoleArn(assumedRoleArn: string): string {
  const arnParts = splitArnParts(assumedRoleArn)
  const rolePathAndName = arnParts.resourcePath?.split('/').slice(0, -1).join('/')
  return `arn:${arnParts.partition}:iam::${arnParts.accountId}:role/${rolePathAndName}`
}

/**
 * Create an assumed role ARN from a role ARN and a session name
 *
 * @param roleArn the role ARN to create an assumed role ARN from
 * @param sessionName the session name to use
 * @returns the assumed role ARN
 */
export function convertRoleArnToAssumedRoleArn(roleArn: string, sessionName: string): string {
  const arnParts = splitArnParts(roleArn)
  const rolePathAndName = arnParts.resourcePath
  return `arn:${arnParts.partition}:sts::${arnParts.accountId}:assumed-role/${rolePathAndName}/${sessionName}`
}

const assumedRoleArnRegex = /^arn:[a-zA-Z\-]+:sts::\d{12}:assumed-role\/.*$/

/**
 * Tests if a principal string is an assumed role ARN
 *
 * @param principal the principal string to test
 * @returns true if the principal is an assumed role ARN, false otherwise
 */
export function isAssumedRoleArn(principal: string): boolean {
  return assumedRoleArnRegex.test(principal)
}

const userArnRegex = /^arn:[a-zA-Z\-]+:iam::\d{12}:user\/.*$/

/**
 * Test if a principal string is an IAM user ARN
 *
 * @param principal the principal string to test
 * @returns true if the principal is an IAM user ARN, false otherwise
 */
export function isIamUserArn(principal: string): boolean {
  return userArnRegex.test(principal)
}

const federatedUserArnRegex = /^arn:[a-zA-Z\-]+:sts::\d{12}:federated-user\/.*$/

/**
 * Test if a principal string is a federated user ARN
 *
 * @param principal the principal string to test
 * @returns true if the principal is a federated user ARN, false otherwise
 */
export function isFederatedUserArn(principal: string): boolean {
  return federatedUserArnRegex.test(principal)
}

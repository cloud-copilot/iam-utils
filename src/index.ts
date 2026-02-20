export { actionMatchesPattern } from './actions.js'
export { getResourceSegments, splitArnParts, type ArnParts } from './arn.js'
export {
  convertAssumedRoleArnToRoleArn,
  convertRoleArnToAssumedRoleArn,
  isArnPrincipal,
  isAssumedRoleArn,
  isFederatedUserArn,
  isIamRoleArn,
  isIamUserArn,
  isServicePrincipal
} from './principals.js'
export { resourceArnWithWildcardsToRegex } from './resources.js'
export { bucketArn, isS3BucketOrObjectArn } from './s3.js'

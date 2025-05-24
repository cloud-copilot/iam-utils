export { getResourceSegments, splitArnParts, type ArnParts } from './arn.js'
export {
  convertAssumedRoleArnToRoleArn,
  convertRoleArnToAssumedRoleArn,
  isAssumedRoleArn,
  isFederatedUserArn,
  isIamUserArn
} from './principals.js'

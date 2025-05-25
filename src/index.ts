export { getResourceSegments, splitArnParts, type ArnParts } from './arn.js'
export {
  convertAssumedRoleArnToRoleArn,
  convertRoleArnToAssumedRoleArn,
  isAssumedRoleArn,
  isFederatedUserArn,
  isIamRoleArn,
  isIamUserArn
} from './principals.js'

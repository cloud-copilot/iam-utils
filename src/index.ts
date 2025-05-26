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

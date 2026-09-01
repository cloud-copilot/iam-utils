const awsResourceInfoExcludedActions = new Set([
  'auditmanager:updateassessmentframeworkshare',
  'detective:acceptinvitation',
  'ds:acceptshareddirectory',
  'ec2:accepttransitgatewaypeeringattachment',
  'ec2:acceptvpcendpointconnections',
  'ec2:acceptvpcpeeringconnection',
  'ec2:copysnapshot',
  'ec2:createtransitgatewaypeeringattachment',
  'ec2:createvpcendpoint',
  'ec2:createvpcpeeringconnection',
  'ec2:deletetransitgatewaypeeringattachment',
  'ec2:deletevpcpeeringconnection',
  'ec2:rejecttransitgatewaypeeringattachment',
  'ec2:rejectvpcendpointconnections',
  'ec2:rejectvpcpeeringconnection',
  'guardduty:acceptadministratorinvitation',
  'macie2:acceptinvitation',
  'es:acceptinboundconnection',
  'route53:associatevpcwithhostedzone',
  'route53:createvpcassociationauthorization',
  'route53:deletevpcassociationauthorization',
  'route53:disassociatevpcfromhostedzone',
  'route53:listhostedzonesbyvpc',
  'securityhub:acceptadministratorinvitation'
])

/**
 * Checks whether an IAM action is excluded from AWS resource-information context keys.
 *
 * AWS does not populate `aws:ResourceAccount`, `aws:ResourceOrgID`, or
 * `aws:ResourceOrgPaths` for every action. This predicate captures the documented
 * excluded actions currently used by Act Security request-context generation.
 *
 * @param action - IAM action to inspect, such as `s3:GetObject`.
 * @returns True when AWS resource-information context keys are not available.
 */
export function isAwsResourceInfoExcludedAction(action: string): boolean {
  const lowerCaseAction = action.toLowerCase()
  return lowerCaseAction.startsWith('ebs:') || awsResourceInfoExcludedActions.has(lowerCaseAction)
}

/**
 * Checks whether AWS resource-information context keys are available for an IAM action.
 *
 * @param action - IAM action to inspect, such as `s3:GetObject`.
 * @returns True when `aws:ResourceAccount`, `aws:ResourceOrgID`, and `aws:ResourceOrgPaths` may be populated.
 */
export function actionSupportsAwsResourceInfoContextKeys(action: string): boolean {
  return !isAwsResourceInfoExcludedAction(action)
}

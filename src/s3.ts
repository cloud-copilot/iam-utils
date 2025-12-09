import { splitArnParts } from './arn.js'

/**
 * Checks to see if an ARN is an S3 bucket or object ARN
 *
 * @param arn the ARN to check
 * @returns whether the ARN is an S3 bucket or object ARN
 */
export function isS3BucketOrObjectArn(arn: string): boolean {
  const arnParts = splitArnParts(arn)
  if (arnParts.service !== 's3') {
    return false
  }
  if (!arnParts.resource) {
    return false
  }
  // S3 bucket or object ARNs have no account ID or region
  if (arnParts.accountId || arnParts.region) {
    return false
  }
  return true
}

/**
 * Get the bucket ARN from an S3 bucket or object ARN. Does not validate the input ARN.
 *
 * @param bucketOrObjectArn the ARN of the S3 bucket or object
 * @returns the ARN of the S3 bucket
 */
export function bucketArn(bucketOrObjectArn: string): string {
  return bucketOrObjectArn.split('/').at(0)!
}

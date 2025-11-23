export interface ArnParts {
  /**
   * The partition of the ARN such as aws, aws-cn, aws-us-gov
   */
  partition: string | undefined

  /**
   * The service of the ARN such as s3, ec2, iam
   */
  service: string | undefined

  /**
   * The region of the ARN such as us-east-1, us-west-2
   */
  region: string | undefined

  /**
   * The account ID of the ARN
   */
  accountId: string | undefined

  /**
   * The resource portion of the ARN, includes the resource type, path and name
   */
  resource: string | undefined

  /**
   * The resource type of the ARN, such as instance, user, topic, may be undefined for
   * some S3 buckets.
   */
  resourceType: string | undefined

  /**
   * The resource path and name of the ARN, such as Development/user1, or MyTopic or my-bucket/my-object.txt
   */
  resourcePath: string | undefined
}

/**
 * Split an ARN into its parts
 *
 * @param arn the arn to split
 * @returns the parts of the ARN
 */
export function splitArnParts(arn: string): ArnParts {
  const parts = arn.split(':')
  const partition = parts.at(1)
  const service = parts.at(2)!
  const region = parts.at(3)!
  const accountId = parts.at(4)!
  const resource = parts.slice(5).join(':')
  const [resourceType, resourcePath] = getResourceSegments(service, accountId, region, resource)

  return {
    partition,
    service,
    region,
    accountId,
    resource,
    resourceType,
    resourcePath
  }
}

/**
 * Get the product/id segments of the resource portion of an ARN.
 * The first segment is the product segment and the second segment is the resource id segment.
 * This could be split by a colon or a slash, so it checks for both. It also checks for S3 buckets/objects.
 *
 * @param resource The resource to get the resource segments. Must be an ARN resource.
 * @returns a tuple with the first segment being the product segment (without the separator) and the second segment being the resource id.
 */
export function getResourceSegments(
  service: string,
  accountId: string,
  region: string,
  resourceString: string
): [string, string] {
  // This is terrible, and I hate it
  if (
    (service === 's3' && accountId === '' && region === '') ||
    service === 'sns' ||
    service === 'sqs'
  ) {
    return ['', resourceString]
  }

  if (resourceString.startsWith('/')) {
    resourceString = resourceString.slice(1)
  }

  const slashIndex = resourceString.indexOf('/')
  const colonIndex = resourceString.indexOf(':')

  let splitIndex = slashIndex
  if (slashIndex != -1 && colonIndex != -1) {
    splitIndex = Math.min(slashIndex, colonIndex) + 1
  } else if (slashIndex == -1 && colonIndex == -1) {
    splitIndex = resourceString.length + 1
  } else if (colonIndex == -1) {
    splitIndex = slashIndex + 1
  } else if (slashIndex == -1) {
    splitIndex = colonIndex + 1
  } else {
    throw new Error(`Unable to split resource ${resourceString}`)
  }

  return [resourceString.slice(0, splitIndex - 1), resourceString.slice(splitIndex)]
}

import { describe, expect, it } from 'vitest'
import {
  mostSpecificMatchingResourceTypePatterns,
  resourceStringMatchesResourceTypePattern
} from './resourceTypes.js'

const resourceStringMatchesResourcePatternTests: {
  pattern: string
  matches: { [resourceString: string]: boolean }
}[] = [
  {
    pattern: '*',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': true,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}': true,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': true,
      'arn:${Partition}:ec2:${Region}:${Account}:elastic-ip/${AllocationId}': true,
      'arn:${Partition}:ec2:${Region}:${Account}:volume/${VolumeId}': true,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': true,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}:${Version}': true,
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': true,
      'arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}': true,
      'arn:${Partition}:kms:${Region}:${Account}:alias/${AliasName}': true
    }
  },
  {
    pattern: 'arn:aws:s3:::*',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': true,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}': false,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': false,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': false,
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': false,
      'arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}': false
    }
  },
  {
    pattern: 'arn:aws:s3:::my-bucket/*',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}': false,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': false,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': false,
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': false
    }
  },
  {
    pattern: 'arn:aws:s3:::*-prod-logs-*/*',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}': false,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': false
    }
  },
  {
    pattern: 'arn:aws:s3:*:*:accesspoint/*',
    matches: {
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}': true,
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': false,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': false
    }
  },
  {
    pattern: 'arn:aws:ec2:*:*:instance/*',
    matches: {
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': true,
      'arn:${Partition}:ec2:${Region}:${Account}:elastic-ip/${AllocationId}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:volume/${VolumeId}': false,
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': false
    }
  },
  {
    pattern: 'arn:aws:ec2:us-*-*:*:volume/vol-*',
    matches: {
      'arn:${Partition}:ec2:${Region}:${Account}:volume/${VolumeId}': true,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:elastic-ip/${AllocationId}': false,
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': false
    }
  },
  {
    pattern: 'arn:aws:lambda:*:*:function:iam-*',
    matches: {
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': true,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}:${Version}': true,
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}': false
    }
  },
  {
    pattern: 'arn:aws:sqs:*:*:*',
    matches: {
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': true,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': false,
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}': false
    }
  },
  {
    pattern: 'arn:aws:kms:*:*:key/*',
    matches: {
      'arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}': true,
      'arn:${Partition}:kms:${Region}:${Account}:alias/${AliasName}': false,
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}': false
    }
  },
  {
    pattern: 'arn:aws:kms:*:*:alias/abac-*',
    matches: {
      'arn:${Partition}:kms:${Region}:${Account}:alias/${AliasName}': true,
      'arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}': false,
      'arn:${Partition}:s3:::${BucketName}': false
    }
  },
  {
    pattern: 'arn:aws:s3:::bucket/',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': false
    }
  },
  {
    pattern: 'arn:aws:s3:::examplebucket/public/*',
    matches: {
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true
    }
  },
  // Single-variable resource components do not absorb separators, preserving S3 bucket vs object matching.
  {
    pattern: 'arn:aws:s3:::my-bucket/path/to/object.txt',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true
    }
  },
  {
    pattern: 'arn:aws:sqs:us-east-1:123456789012:queue/subpath',
    matches: {
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': false
    }
  },
  {
    pattern: 'arn:aws:sqs:us-east-1:123456789012:queue:subpath',
    matches: {
      'arn:${Partition}:sqs:${Region}:${Account}:${QueueName}': false
    }
  },
  // IAM wildcards in resource strings are supported, including ? and adjacent wildcard tokens.
  {
    pattern: 'arn:aws:s3:::my-bucke?',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': true,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': false
    }
  },
  {
    pattern: 'arn:aws:s3:::my-buck?t/*?',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true
    }
  },
  {
    pattern: 'arn:aws:s3:::my-bucket/**',
    matches: {
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true
    }
  },
  {
    pattern: 'arn:aws:s3:::my-bucket/?*',
    matches: {
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': true
    }
  },
  // Static resource type pattern text is literal, even when it contains regex metacharacters.
  {
    pattern: 'arn:aws:proton:us-east-1:123456789012:environment-template/my-template:1.0',
    matches: {
      'arn:${Partition}:proton:${Region}:${Account}:environment-template/${TemplateName}:${MajorVersionId}.${MinorVersionId}': true
    }
  },
  {
    pattern: 'arn:aws:proton:us-east-1:123456789012:environment-template/my-template:1X0',
    matches: {
      'arn:${Partition}:proton:${Region}:${Account}:environment-template/${TemplateName}:${MajorVersionId}.${MinorVersionId}': false
    }
  },
  {
    pattern: 'arn:aws:apigateway:us-east-1::/domainnames/example.com+abc/basepathmappings/root',
    matches: {
      'arn:${Partition}:apigateway:${Region}::/domainnames/${DomainName}+${DomainIdentifier}/basepathmappings/${BasePath}': true
    }
  },
  // Resource type variables can span resource-component separators before later static components.
  {
    pattern:
      'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/myFunction:log-stream:fh389r7cj292h',
    matches: {
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}:log-stream:${LogStreamName}': true,
      // This helper checks a single pattern in isolation. Choosing the most specific match
      // from all resource type patterns belongs in callers with that broader context.
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}': true,
      'arn:${Partition}:logs:${Region}:${Account}:destination:${DestinationName}': false
    }
  },
  {
    pattern: 'arn:aws:logs:us-east-1:123456789012:log-group:custom:group:name:log-stream:stream-id',
    matches: {
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}:log-stream:${LogStreamName}': true,
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}': true,
      'arn:${Partition}:logs:${Region}:${Account}:destination:${DestinationName}': false
    }
  },
  {
    pattern: 'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/myFunction',
    matches: {
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}': true,
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}:log-stream:${LogStreamName}': false
    }
  },
  {
    pattern: 'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/*:log-stream:*',
    matches: {
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}:log-stream:${LogStreamName}': true,
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}': true,
      'arn:${Partition}:logs:${Region}:${Account}:destination:${DestinationName}': false
    }
  },
  // Static ARN resource-type labels can differ in case between iam-data and concrete AWS ARNs.
  {
    pattern:
      'arn:AWS:GuardDuty:us-east-1:123456789012:detector/example-detector/publishingDestination/example-destination',
    matches: {
      'arn:${Partition}:guardduty:${Region}:${Account}:detector/${DetectorId}/publishingdestination/${PublishingDestinationId}': true
    }
  },
  {
    pattern:
      'arn:aws:guardduty:us-east-1:123456789012:detector/example-detector/publishingdestination/example-destination',
    matches: {
      'arn:${Partition}:guardduty:${Region}:${Account}:detector/${DetectorId}/publishingDestination/${PublishingDestinationId}': true
    }
  },
  // A trailing variable spans slashes, so a sub-resource ARN matches its own
  // type AND its parent's. Disambiguating between the two needs the service's
  // full type list and belongs in callers that choose one type.
  {
    pattern:
      'arn:aws:dynamodb:us-east-1:123456789012:table/SyntheticSubscribers/stream/2024-01-01T00:00:00.000',
    matches: {
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/stream/${StreamLabel}': true,
      // The trailing ${TableName} absorbs the stream suffix.
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}': true,
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/index/${IndexName}': false,
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/backup/${BackupName}': false
    }
  },
  // S3 access point objects: the trailing variables absorb slashes.
  {
    pattern: 'arn:aws:s3:us-east-1:123456789012:accesspoint/example-ap/object/a/b/c.txt',
    matches: {
      // The trailing ${AccessPointName} absorbs the object suffix.
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}': true,
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}': true,
      'arn:${Partition}:s3:::${BucketName}': false,
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}': false
    }
  }
]

describe('resourceStringMatchesResourcePattern', () => {
  for (const testCase of resourceStringMatchesResourcePatternTests) {
    describe(`Pattern: ${testCase.pattern}`, () => {
      for (const [arnFormat, expectedResult] of Object.entries(testCase.matches)) {
        it(`should return ${expectedResult} for resource string: ${arnFormat}`, () => {
          // Given a resource pattern and resource string
          const resourceString = testCase.pattern
          const resourcePattern = arnFormat

          // When checking if the resource string matches the pattern
          const result = resourceStringMatchesResourceTypePattern(resourceString, resourcePattern)

          // Then the result should match the expected result
          expect(result).toBe(expectedResult)
        })
      }
    })
  }
})

const mostSpecificMatchingResourceTypePatternsTests: {
  name: string
  resourceString: string
  resourcePatterns: string[]
  expected: string[]
}[] = [
  {
    name: 'returns the log stream pattern instead of the parent log group pattern',
    resourceString:
      'arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/myFunction:log-stream:fh389r7cj292h',
    resourcePatterns: [
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}',
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}:log-stream:${LogStreamName}',
      'arn:${Partition}:logs:${Region}:${Account}:destination:${DestinationName}'
    ],
    expected: [
      'arn:${Partition}:logs:${Region}:${Account}:log-group:${LogGroupName}:log-stream:${LogStreamName}'
    ]
  },
  {
    name: 'returns the DynamoDB stream pattern instead of the parent table pattern',
    resourceString:
      'arn:aws:dynamodb:us-east-1:123456789012:table/SyntheticSubscribers/stream/2024-01-01T00:00:00.000',
    resourcePatterns: [
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}',
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/index/${IndexName}',
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/stream/${StreamLabel}'
    ],
    expected: [
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/stream/${StreamLabel}'
    ]
  },
  {
    name: 'returns the S3 access point object pattern instead of the parent access point pattern',
    resourceString: 'arn:aws:s3:us-east-1:123456789012:accesspoint/example-ap/object/a/b/c.txt',
    resourcePatterns: [
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}',
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}',
      'arn:${Partition}:s3:::${BucketName}',
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}'
    ],
    expected: [
      'arn:${Partition}:s3:${Region}:${Account}:accesspoint/${AccessPointName}/object/${ObjectName}'
    ]
  },
  {
    name: 'returns the S3 object pattern instead of the bucket pattern',
    resourceString: 'arn:aws:s3:::my-bucket/path/to/object.txt',
    resourcePatterns: [
      'arn:${Partition}:s3:::${BucketName}',
      'arn:${Partition}:s3:::${BucketName}/${ObjectName}'
    ],
    expected: ['arn:${Partition}:s3:::${BucketName}/${ObjectName}']
  },
  {
    name: 'returns the colon-delimited child pattern instead of the parent pattern',
    resourceString: 'arn:aws:batch:us-east-1:123456789012:job-definition/synthetic-definition:3',
    resourcePatterns: [
      'arn:${Partition}:batch:${Region}:${Account}:job-definition/${JobDefinitionName}',
      'arn:${Partition}:batch:${Region}:${Account}:job-definition/${JobDefinitionName}:${Revision}'
    ],
    expected: [
      'arn:${Partition}:batch:${Region}:${Account}:job-definition/${JobDefinitionName}:${Revision}'
    ]
  },
  {
    name: 'returns the parent pattern for a colon-delimited parent ARN',
    resourceString: 'arn:aws:batch:us-east-1:123456789012:job-definition/synthetic-definition',
    resourcePatterns: [
      'arn:${Partition}:batch:${Region}:${Account}:job-definition/${JobDefinitionName}',
      'arn:${Partition}:batch:${Region}:${Account}:job-definition/${JobDefinitionName}:${Revision}'
    ],
    expected: ['arn:${Partition}:batch:${Region}:${Account}:job-definition/${JobDefinitionName}']
  },
  {
    name: 'returns the child pattern when the parent pattern ends with a delimiter',
    resourceString:
      'arn:aws:cassandra:us-east-1:123456789012:/keyspace/synthetic-keyspace/table/synthetic-table',
    resourcePatterns: [
      'arn:${Partition}:cassandra:${Region}:${Account}:/keyspace/${KeyspaceName}/',
      'arn:${Partition}:cassandra:${Region}:${Account}:/keyspace/${KeyspaceName}/table/${TableName}'
    ],
    expected: [
      'arn:${Partition}:cassandra:${Region}:${Account}:/keyspace/${KeyspaceName}/table/${TableName}'
    ]
  },
  {
    name: 'returns the parent pattern for a parent ARN ending with a delimiter',
    resourceString: 'arn:aws:cassandra:us-east-1:123456789012:/keyspace/synthetic-keyspace/',
    resourcePatterns: [
      'arn:${Partition}:cassandra:${Region}:${Account}:/keyspace/${KeyspaceName}/',
      'arn:${Partition}:cassandra:${Region}:${Account}:/keyspace/${KeyspaceName}/table/${TableName}'
    ],
    expected: ['arn:${Partition}:cassandra:${Region}:${Account}:/keyspace/${KeyspaceName}/']
  },
  {
    name: 'keeps every matching type for a wildcard resource',
    resourceString: 'arn:aws:dynamodb:us-east-1:123456789012:table/*',
    resourcePatterns: [
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}',
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/stream/${StreamLabel}'
    ],
    expected: [
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}',
      'arn:${Partition}:dynamodb:${Region}:${Account}:table/${TableName}/stream/${StreamLabel}'
    ]
  },
  {
    name: 'keeps multiple equally specific matching patterns',
    resourceString: 'arn:aws:example:us-east-1:123456789012:thing/root/child/leaf',
    resourcePatterns: [
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}',
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${ChildName}',
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${OtherChildName}'
    ],
    expected: [
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${ChildName}',
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${OtherChildName}'
    ]
  },
  {
    name: 'preserves input order for remaining most-specific matches',
    resourceString: 'arn:aws:example:us-east-1:123456789012:thing/root/child/leaf',
    resourcePatterns: [
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${OtherChildName}',
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}',
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${ChildName}'
    ],
    expected: [
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${OtherChildName}',
      'arn:${Partition}:example:${Region}:${Account}:thing/${ThingName}/child/${ChildName}'
    ]
  },
  {
    name: 'filters out non-matching patterns before reducing specificity',
    resourceString: 'arn:aws:kms:us-east-1:123456789012:key/1234abcd',
    resourcePatterns: [
      'arn:${Partition}:kms:${Region}:${Account}:alias/${AliasName}',
      'arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}',
      'arn:${Partition}:s3:::${BucketName}'
    ],
    expected: ['arn:${Partition}:kms:${Region}:${Account}:key/${KeyId}']
  },
  {
    name: 'returns an empty array when no patterns match',
    resourceString: 'arn:aws:kms:us-east-1:123456789012:key/1234abcd',
    resourcePatterns: [
      'arn:${Partition}:s3:::${BucketName}',
      'arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}'
    ],
    expected: []
  }
]

describe('mostSpecificMatchingResourceTypePatterns', () => {
  for (const testCase of mostSpecificMatchingResourceTypePatternsTests) {
    it(testCase.name, () => {
      // Given a resource string and candidate resource type patterns
      const resourceString = testCase.resourceString
      const resourcePatterns = testCase.resourcePatterns

      // When the patterns are reduced to the most specific matches
      const result = mostSpecificMatchingResourceTypePatterns(resourceString, resourcePatterns)

      // Then only the most specific matching patterns are returned
      expect(result).toEqual(testCase.expected)
    })
  }
})

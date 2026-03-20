import { describe, expect, it } from 'vitest'
import { convertResourcePatternToRegex } from './resourcePatterns.js'

describe('convertResourcePatternToRegex', () => {
  it('should convert a simple pattern with one variable', () => {
    //Given a pattern with a single variable
    const pattern = 'arn:${Partition}:s3:::${BucketName}'

    //When converting to a regex
    const result = convertResourcePatternToRegex(pattern)

    //Then it should produce an anchored regex with named capture groups
    expect(result).toBe('^arn:(?<partition>(.+?)):s3:::(?<bucketName>(.+?))$')
  })

  it('should convert a pattern with multiple variables', () => {
    //Given a pattern with multiple variables
    const pattern = 'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}'

    //When converting to a regex
    const result = convertResourcePatternToRegex(pattern)

    //Then each variable should become a named capture group
    expect(result).toBe(
      '^arn:(?<partition>(.+?)):ec2:(?<region>(.+?)):(?<account>(.+?)):instance/(?<instanceId>(.+?))$'
    )
  })

  it('should match a concrete ARN against the generated regex', () => {
    //Given a pattern and a concrete ARN
    const pattern = 'arn:${Partition}:s3:::${BucketName}/${ObjectName}'
    const arn = 'arn:aws:s3:::my-bucket/my-object.txt'

    //When converting and testing
    const regex = new RegExp(convertResourcePatternToRegex(pattern))
    const match = arn.match(regex)

    //Then it should match and capture the variable values
    expect(match).not.toBeNull()
    expect(match!.groups!.partition).toBe('aws')
    expect(match!.groups!.bucketName).toBe('my-bucket')
    expect(match!.groups!.objectName).toBe('my-object.txt')
  })

  it('should not match a non-matching ARN', () => {
    //Given a pattern for EC2 instances
    const pattern = 'arn:${Partition}:ec2:${Region}:${Account}:instance/${InstanceId}'
    const arn = 'arn:aws:s3:::my-bucket'

    //When converting and testing
    const regex = new RegExp(convertResourcePatternToRegex(pattern))
    const match = arn.match(regex)

    //Then it should not match
    expect(match).toBeNull()
  })

  it('should handle a pattern with no variables', () => {
    //Given a pattern with no variables
    const pattern = 'arn:aws:s3:::my-bucket'

    //When converting to a regex
    const result = convertResourcePatternToRegex(pattern)

    //Then it should be a literal regex
    expect(result).toBe('^arn:aws:s3:::my-bucket$')
  })
})

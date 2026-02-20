import { describe, expect, it } from 'vitest'
import { resourceArnWithWildcardsToRegex } from './resources.js'

describe('resourceArnWithWildcardsToRegex', () => {
  it('should match an exact ARN when no wildcard is present', () => {
    //Given an ARN pattern with no wildcard
    const pattern = 'arn:aws:s3:::my-bucket/my-object.txt'
    const regex = resourceArnWithWildcardsToRegex(pattern)

    //When testing a matching ARN and a non-matching ARN
    const matchingArn = regex.test('arn:aws:s3:::my-bucket/my-object.txt')
    const nonMatchingArn = regex.test('arn:aws:s3:::my-bucket/other-object.txt')

    //Then only the exact ARN should match
    expect(matchingArn).toBe(true)
    expect(nonMatchingArn).toBe(false)
  })

  it('should match ARNs with a single wildcard segment', () => {
    //Given an ARN pattern with one wildcard
    const pattern = 'arn:aws:s3:::my-bucket/*'
    const regex = resourceArnWithWildcardsToRegex(pattern)

    //When testing ARNs under the same bucket path
    const objectMatch = regex.test('arn:aws:s3:::my-bucket/file.txt')
    const nestedObjectMatch = regex.test('arn:aws:s3:::my-bucket/folder/file.txt')
    const otherBucketMatch = regex.test('arn:aws:s3:::other-bucket/file.txt')

    //Then only ARNs in the matching bucket path should match
    expect(objectMatch).toBe(true)
    expect(nestedObjectMatch).toBe(true)
    expect(otherBucketMatch).toBe(false)
  })

  it('should match ARNs with multiple wildcards', () => {
    //Given an ARN pattern with multiple wildcards
    const pattern = 'arn:aws:lambda:*:123456789012:function:*'
    const regex = resourceArnWithWildcardsToRegex(pattern)

    //When testing function ARNs in different regions and names
    const firstMatch = regex.test('arn:aws:lambda:us-east-1:123456789012:function:my-function')
    const secondMatch = regex.test(
      'arn:aws:lambda:eu-west-1:123456789012:function:another-function'
    )
    const accountMismatch = regex.test('arn:aws:lambda:us-east-1:999999999999:function:my-function')

    //Then ARNs matching all non-wildcard segments should match
    expect(firstMatch).toBe(true)
    expect(secondMatch).toBe(true)
    expect(accountMismatch).toBe(false)
  })

  it('should escape regex special characters in the ARN pattern', () => {
    //Given an ARN pattern that contains regex special characters
    const pattern = 'arn:aws:s3:::my.bucket/path+name(file).txt'
    const regex = resourceArnWithWildcardsToRegex(pattern)

    //When testing the literal ARN and a similar but different ARN
    const literalMatch = regex.test('arn:aws:s3:::my.bucket/path+name(file).txt')
    const alteredMatch = regex.test('arn:aws:s3:::myXbucket/path+name(file).txt')

    //Then the pattern should be matched literally
    expect(literalMatch).toBe(true)
    expect(alteredMatch).toBe(false)
  })

  it('should anchor matches to the beginning and end of the ARN', () => {
    //Given an ARN pattern that should match exactly
    const pattern = 'arn:aws:s3:::my-bucket'
    const regex = resourceArnWithWildcardsToRegex(pattern)

    //When testing values that include extra prefix or suffix characters
    const prefixedMatch = regex.test('prefix-arn:aws:s3:::my-bucket')
    const suffixedMatch = regex.test('arn:aws:s3:::my-bucket-suffix')

    //Then neither value should match
    expect(prefixedMatch).toBe(false)
    expect(suffixedMatch).toBe(false)
  })
})

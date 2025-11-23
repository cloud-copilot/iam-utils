import { describe, expect, it } from 'vitest'
import { isS3BucketOrObjectArn } from './s3.js'

describe('isS3BucketOrObjectArn', () => {
  it('should return true for a valid S3 bucket ARN', () => {
    //Given a valid S3 bucket ARN
    const arn = 'arn:aws:s3:::my-bucket'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be true
    expect(result).toBe(true)
  })

  it('should return true for a valid S3 object ARN', () => {
    //Given a valid S3 object ARN
    const arn = 'arn:aws:s3:::my-bucket/my-object'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be true
    expect(result).toBe(true)
  })

  it('should return true for a valid S3 object ARN with nested path', () => {
    //Given a valid S3 object ARN with nested path
    const arn = 'arn:aws:s3:::my-bucket/folder/subfolder/my-object'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be true
    expect(result).toBe(true)
  })

  it('should return false for an ARN with a different service', () => {
    //Given an ARN for a different service
    const arn = 'arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be false
    expect(result).toBe(false)
  })

  it('should return false for an S3 ARN with a region', () => {
    //Given an S3 ARN with a region
    const arn = 'arn:aws:s3:us-east-1::my-bucket'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be false
    expect(result).toBe(false)
  })

  it('should return false for an S3 ARN with an account ID', () => {
    //Given an S3 ARN with an account ID
    const arn = 'arn:aws:s3::123456789012:my-bucket'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be false
    expect(result).toBe(false)
  })

  it('should return false for an S3 ARN with both region and account ID', () => {
    //Given an S3 ARN with both region and account ID
    const arn = 'arn:aws:s3:us-east-1:123456789012:my-bucket'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be false
    expect(result).toBe(false)
  })

  it('should return false for an S3 ARN without a resource', () => {
    //Given an S3 ARN without a resource
    const arn = 'arn:aws:s3:::'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be false
    expect(result).toBe(false)
  })

  it('should return false for an S3 access point ARN', () => {
    //Given an S3 access point ARN
    const arn = 'arn:aws:s3:us-west-2:123456789012:accesspoint/my-access-point'

    //When checking if it is an S3 bucket or object ARN
    const result = isS3BucketOrObjectArn(arn)

    //Then the result should be false
    expect(result).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import {
  convertAssumedRoleArnToRoleArn,
  convertRoleArnToAssumedRoleArn,
  isAssumedRoleArn,
  isFederatedUserArn,
  isIamUserArn
} from './principals.js'

describe('convertAssumedRoleArnToRoleArn', () => {
  it('should return the role ARN from an assumed role ARN', () => {
    //Given an assumed role ARN
    const assumedRoleArn = 'arn:aws:sts::123456789012:assumed-role/role-name/session-name'

    //When we get the role ARN from the assumed role ARN
    const result = convertAssumedRoleArnToRoleArn(assumedRoleArn)

    //Then it should return the role ARN
    expect(result).toBe('arn:aws:iam::123456789012:role/role-name')
  })

  it('should return the role ARN from an assumed role ARN with a path', () => {
    //Given an assumed role ARN
    const assumedRoleArn = 'arn:aws:sts::123456789012:assumed-role/admin/global-admin/session-name'

    //When we get the role ARN from the assumed role ARN
    const result = convertAssumedRoleArnToRoleArn(assumedRoleArn)

    //Then it should return the role ARN
    expect(result).toBe('arn:aws:iam::123456789012:role/admin/global-admin')
  })

  it('should work in a different partition', () => {
    //Given an assumed role ARN with a different partition
    const assumedRoleArn = 'arn:aws-cn:sts::123456789012:assumed-role/role-name/session-name'

    //When we get the role ARN from the assumed role ARN
    const result = convertAssumedRoleArnToRoleArn(assumedRoleArn)

    //Then it should return the role ARN
    expect(result).toBe('arn:aws-cn:iam::123456789012:role/role-name')
  })
})

describe('convertRoleArnToAssumedRoleArn', () => {
  it('should return the assumed role ARN from a role ARN', () => {
    //Given a role ARN
    const roleArn = 'arn:aws:iam::123456789012:role/role-name'

    //When we get the assumed role ARN from the role ARN
    const result = convertRoleArnToAssumedRoleArn(roleArn, 'session-name')

    //Then it should return the assumed role ARN
    expect(result).toBe('arn:aws:sts::123456789012:assumed-role/role-name/session-name')
  })

  it('should return the assumed role ARN from a role ARN with a path', () => {
    //Given a role ARN
    const roleArn = 'arn:aws:iam::123456789012:role/admin/global-admin'

    //When we get the assumed role ARN from the role ARN
    const result = convertRoleArnToAssumedRoleArn(roleArn, 'session-name')

    //Then it should return the assumed role ARN
    expect(result).toBe('arn:aws:sts::123456789012:assumed-role/admin/global-admin/session-name')
  })

  it('should work with a different partition', () => {
    //Given a role ARN with a different partition
    const roleArn = 'arn:aws-cn:iam::123456789012:role/role-name'

    //When we get the assumed role ARN from the role ARN
    const result = convertRoleArnToAssumedRoleArn(roleArn, 'session-name')

    //Then it should return the assumed role ARN
    expect(result).toBe('arn:aws-cn:sts::123456789012:assumed-role/role-name/session-name')
  })
})

describe('isAssumedRoleArn', () => {
  it('should return true for assumed role ARN', () => {
    //Given an assumed role ARN
    const assumedRoleArn = 'arn:aws:sts::123456789012:assumed-role/role-name/session-name'

    //When we check if it is an assumed role ARN
    const result = isAssumedRoleArn(assumedRoleArn)

    //Then it should return true
    expect(result).toBe(true)
  })

  it('should return false for non-assumed role ARN', () => {
    //Given a non-assumed role ARN
    const userArn = 'arn:aws:iam::123456789012:user/user-name'

    //When we check if it is an assumed role ARN
    const result = isAssumedRoleArn(userArn)

    //Then it should return false
    expect(result).toBe(false)
  })

  it('should work for a different partition', () => {
    //Given an assumed role ARN with a different partition
    const assumedRoleArn = 'arn:aws-cn:sts::123456789012:assumed-role/role-name/session-name'

    //When we check if it is an assumed role ARN
    const result = isAssumedRoleArn(assumedRoleArn)

    //Then it should return true
    expect(result).toBe(true)
  })
})

describe('isIamUserArn', () => {
  it('should return true for IAM user ARN', () => {
    //Given an IAM user ARN
    const userArn = 'arn:aws:iam::123456789012:user/user-name'

    //When we check if it is an IAM user ARN
    const result = isIamUserArn(userArn)

    //Then it should return true
    expect(result).toBe(true)
  })

  it('should return false for non-IAM user ARN', () => {
    //Given a non-IAM user ARN
    const roleArn = 'arn:aws:sts::123456789012:assumed-role/role-name/session-name'

    //When we check if it is an IAM user ARN
    const result = isIamUserArn(roleArn)

    //Then it should return false
    expect(result).toBe(false)
  })

  it('should work for a different partition', () => {
    //Given an IAM user ARN with a different partition
    const userArn = 'arn:aws-cn:iam::123456789012:user/user-name'

    //When we check if it is an IAM user ARN
    const result = isIamUserArn(userArn)

    //Then it should return true
    expect(result).toBe(true)
  })
})

describe('isFederatedUserArn', () => {
  it('should return true for federated user ARN', () => {
    //Given a federated user ARN
    const federatedUserArn = 'arn:aws:sts::123456789012:federated-user/user-name'

    //When we check if it is a federated user ARN
    const result = isFederatedUserArn(federatedUserArn)

    //Then it should return true
    expect(result).toBe(true)
  })

  it('should return false for non-federated user ARN', () => {
    //Given a non-federated user ARN
    const roleArn = 'arn:aws:sts::123456789012:assumed-role/role-name/session-name'

    //When we check if it is a federated user ARN
    const result = isFederatedUserArn(roleArn)

    //Then it should return false
    expect(result).toBe(false)
  })

  it('should work for a different partition', () => {
    //Given a federated user ARN with a different partition
    const federatedUserArn = 'arn:aws-cn:sts::123456789012:federated-user/user-name'

    //When we check if it is a federated user ARN
    const result = isFederatedUserArn(federatedUserArn)

    //Then it should return true
    expect(result).toBe(true)
  })
})

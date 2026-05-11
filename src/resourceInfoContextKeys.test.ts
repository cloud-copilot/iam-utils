import { describe, expect, it } from 'vitest'
import {
  actionSupportsAwsResourceInfoContextKeys,
  isAwsResourceInfoExcludedAction
} from './resourceInfoContextKeys.js'

describe('isAwsResourceInfoExcludedAction', () => {
  it('should return true for explicitly excluded cross-account actions', () => {
    //Given an action documented as excluded from resource-information context keys
    const action = 'ec2:CopySnapshot'

    //When the action is checked
    const result = isAwsResourceInfoExcludedAction(action)

    //Then it should be excluded
    expect(result).toBe(true)
  })

  it('should return true for all EBS actions', () => {
    //Given an EBS action
    const action = 'ebs:StartSnapshot'

    //When the action is checked
    const result = isAwsResourceInfoExcludedAction(action)

    //Then it should be excluded
    expect(result).toBe(true)
  })

  it('should match actions case-insensitively', () => {
    //Given an excluded action with mixed casing
    const action = 'EC2:CopySnapshot'

    //When the action is checked
    const result = isAwsResourceInfoExcludedAction(action)

    //Then it should be excluded
    expect(result).toBe(true)
  })

  it('should return false for normal supported actions', () => {
    //Given a normal resource action
    const action = 's3:GetObject'

    //When the action is checked
    const result = isAwsResourceInfoExcludedAction(action)

    //Then it should not be excluded
    expect(result).toBe(false)
  })
})

describe('actionSupportsAwsResourceInfoContextKeys', () => {
  it('should return true for supported actions', () => {
    //Given a normal resource action
    const action = 's3:GetObject'

    //When resource-info support is checked
    const result = actionSupportsAwsResourceInfoContextKeys(action)

    //Then resource-information context keys can be populated
    expect(result).toBe(true)
  })

  it('should return false for excluded actions', () => {
    //Given an excluded action
    const action = 'route53:ListHostedZonesByVPC'

    //When resource-info support is checked
    const result = actionSupportsAwsResourceInfoContextKeys(action)

    //Then resource-information context keys are unavailable
    expect(result).toBe(false)
  })
})

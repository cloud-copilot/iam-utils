import { describe, expect, it } from 'vitest'
import { actionMatchesPattern } from './actions.js'

describe('actionMatchesPattern', () => {
  describe('exact matches', () => {
    it('should return true for an exact match', () => {
      //Given an action and a matching pattern
      const action = 's3:GetObject'
      const pattern = 's3:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should return false for a non-matching action', () => {
      //Given an action and a non-matching pattern
      const action = 's3:GetObject'
      const pattern = 's3:PutObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })
  })

  describe('case insensitivity', () => {
    it('should match regardless of case', () => {
      //Given an action with different casing than the pattern
      const action = 's3:getobject'
      const pattern = 'S3:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match uppercase action to lowercase pattern', () => {
      //Given an uppercase action and lowercase pattern
      const action = 'S3:GETOBJECT'
      const pattern = 's3:getobject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })
  })

  describe('asterisk wildcard (*)', () => {
    it('should match all actions with a full wildcard', () => {
      //Given an action and a full wildcard pattern
      const action = 's3:GetObject'
      const pattern = '*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match all actions for a service with a service wildcard', () => {
      //Given an action and a service wildcard pattern
      const action = 's3:GetObject'
      const pattern = 's3:*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match actions with a prefix wildcard', () => {
      //Given an action and a prefix wildcard pattern
      const action = 's3:GetObject'
      const pattern = 's3:Get*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match actions with a suffix wildcard in the action part', () => {
      //Given an action and a suffix wildcard pattern with matching service
      const action = 's3:GetObject'
      const pattern = 's3:*Object'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should not match when pattern has suffix wildcard without service', () => {
      //Given an action and a suffix wildcard pattern without service prefix
      const action = 's3:GetObject'
      const pattern = '*Object'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false (service must match exactly or use full wildcard)
      expect(result).toBe(false)
    })

    it('should match actions with a middle wildcard', () => {
      //Given an action and a middle wildcard pattern
      const action = 's3:GetObject'
      const pattern = 's3:G*ject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should not match when wildcard pattern does not align', () => {
      //Given an action and a non-matching wildcard pattern
      const action = 's3:GetObject'
      const pattern = 's3:Put*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })

    it('should not match with service wildcard pattern', () => {
      //Given an action and a pattern with wildcard in service position
      const action = 's3:GetObject'
      const pattern = '*:*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false (service must match exactly or use full wildcard)
      expect(result).toBe(false)
    })

    it('should match with multiple wildcards in action part only', () => {
      //Given an action and a pattern with wildcards only in the action part
      const action = 's3:GetObjectVersion'
      const pattern = 's3:*Object*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match empty string with asterisk wildcard', () => {
      //Given an action and a pattern where asterisk matches empty string
      const action = 's3:Get'
      const pattern = 's3:Get*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })
  })

  describe('question mark wildcard (?)', () => {
    it('should match a single character with question mark', () => {
      //Given an action and a pattern with a question mark wildcard
      const action = 's3:GetObject'
      const pattern = 's3:GetObjec?' // spellchecker:disable-line

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match multiple single characters with multiple question marks', () => {
      //Given an action and a pattern with multiple question marks
      const action = 's3:GetObject'
      const pattern = 's3:GetObj???' // spellchecker:disable-line

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should not match when question mark represents no character', () => {
      //Given an action shorter than expected by the pattern
      const action = 's3:GetObjec' // spellchecker:disable-line
      const pattern = 's3:GetObjec?t' // spellchecker:disable-line

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })

    it('should not match when action has more characters than pattern expects', () => {
      //Given an action with more characters than the pattern
      const action = 's3:GetObjects'
      const pattern = 's3:GetObjec?' // spellchecker:disable-line

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })
  })

  describe('combined wildcards', () => {
    it('should match with both asterisk and question mark wildcards in action part', () => {
      //Given an action and a pattern with both wildcard types in action part
      const action = 's3:GetObjectVersion'
      const pattern = 's3:G?t*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match complex pattern with multiple wildcard types in action part', () => {
      //Given an action and a complex pattern with wildcards in action part
      const action = 'iam:CreateUser'
      const pattern = 'iam:Cr?ate*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should not match when question mark wildcard is in service part', () => {
      //Given an action and a pattern with question mark in service
      const action = 'iam:CreateUser'
      const pattern = 'i?m:CreateUser'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false (service must match exactly)
      expect(result).toBe(false)
    })
  })

  describe('unicode character handling', () => {
    it('should handle escaped unicode in pattern', () => {
      //Given an action with a regular character and pattern with escaped unicode
      const action = 's3:GetObject'
      const pattern = 's3:GetObjec\\u0074' // spellchecker:disable-line

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true (\\u0074 is 't')
      expect(result).toBe(true)
    })

    it('should handle escaped unicode in action', () => {
      //Given an action with escaped unicode and a regular pattern
      const action = 's3:GetObjec\\u0074' // spellchecker:disable-line
      const pattern = 's3:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should handle escaped unicode in both action and pattern', () => {
      //Given both action and pattern with escaped unicode
      const action = 's3:\\u0047etObject'
      const pattern = 's3:G\\u0065tObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true (\\u0047 is 'G', \\u0065 is 'e')
      expect(result).toBe(true)
    })
  })

  describe('service matching rules', () => {
    it('should not match when service has a wildcard prefix', () => {
      //Given an action and a pattern with wildcard in service prefix
      const action = 's3:GetObject'
      const pattern = '*3:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false (service must match exactly)
      expect(result).toBe(false)
    })

    it('should not match when service has a wildcard suffix', () => {
      //Given an action and a pattern with wildcard in service suffix
      const action = 's3:GetObject'
      const pattern = 's*:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false (service must match exactly)
      expect(result).toBe(false)
    })

    it('should not match when service has a question mark wildcard', () => {
      //Given an action and a pattern with question mark in service
      const action = 's3:GetObject'
      const pattern = 's?:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false (service must match exactly)
      expect(result).toBe(false)
    })

    it('should match when services match exactly with different cases', () => {
      //Given an action and a pattern with different service casing
      const action = 'S3:GetObject'
      const pattern = 's3:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true (case-insensitive)
      expect(result).toBe(true)
    })

    it('should not match when services are different', () => {
      //Given an action and a pattern with different services
      const action = 's3:GetObject'
      const pattern = 'ec2:GetObject'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })
  })

  describe('common AWS actions', () => {
    it('should match ec2:* pattern', () => {
      //Given an EC2 action and a service wildcard
      const action = 'ec2:DescribeInstances'
      const pattern = 'ec2:*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match iam:Get* pattern', () => {
      //Given an IAM Get action and a Get prefix wildcard
      const action = 'iam:GetUser'
      const pattern = 'iam:Get*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match lambda:InvokeFunction exactly', () => {
      //Given a Lambda invoke action
      const action = 'lambda:InvokeFunction'
      const pattern = 'lambda:InvokeFunction'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should not match different service actions', () => {
      //Given an S3 action and an EC2 pattern
      const action = 's3:GetObject'
      const pattern = 'ec2:*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should match empty action with empty pattern', () => {
      //Given empty strings
      const action = ''
      const pattern = ''

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should match empty action with asterisk pattern', () => {
      //Given an empty action and asterisk pattern
      const action = ''
      const pattern = '*'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true
      expect(result).toBe(true)
    })

    it('should not match empty action with question mark pattern', () => {
      //Given an empty action and question mark pattern
      const action = ''
      const pattern = '?'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return false
      expect(result).toBe(false)
    })

    it('should handle special regex characters in pattern', () => {
      //Given an action with special regex characters
      const action = 's3:Get.Object'
      const pattern = 's3:Get.Object'

      //When checking if the action matches the pattern
      const result = actionMatchesPattern(action, pattern)

      //Then it should return true (dot is treated literally)
      expect(result).toBe(true)
    })
  })
})

import { parseJsonField, stringifyJsonField } from '@/lib/json-utils'

describe('JSON Utility Functions', () => {
  describe('parseJsonField', () => {
    it('should parse valid JSON string', () => {
      const jsonString = JSON.stringify({ min: 5, max: 10 })
      const result = parseJsonField<{ min: number; max: number }>(jsonString)
      expect(result).toEqual({ min: 5, max: 10 })
    })

    it('should return null for null input', () => {
      const result = parseJsonField(null)
      expect(result).toBeNull()
    })

    it('should return null for undefined input', () => {
      const result = parseJsonField(undefined)
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON', () => {
      const result = parseJsonField('invalid json')
      expect(result).toBeNull()
    })

    it('should parse array JSON', () => {
      const jsonString = JSON.stringify(['tag1', 'tag2', 'tag3'])
      const result = parseJsonField<string[]>(jsonString)
      expect(result).toEqual(['tag1', 'tag2', 'tag3'])
    })
  })

  describe('stringifyJsonField', () => {
    it('should stringify valid object', () => {
      const obj = { min: 5, max: 10 }
      const result = stringifyJsonField(obj)
      expect(result).toBe(JSON.stringify(obj))
    })

    it('should return null for null input', () => {
      const result = stringifyJsonField(null)
      expect(result).toBeNull()
    })

    it('should return null for undefined input', () => {
      const result = stringifyJsonField(undefined)
      expect(result).toBeNull()
    })

    it('should stringify array', () => {
      const arr = ['tag1', 'tag2', 'tag3']
      const result = stringifyJsonField(arr)
      expect(result).toBe(JSON.stringify(arr))
    })

    it('should handle empty objects', () => {
      const result = stringifyJsonField({})
      expect(result).toBe('{}')
    })

    it('should handle empty arrays', () => {
      const result = stringifyJsonField([])
      expect(result).toBe('[]')
    })
  })

  describe('Round-trip conversion', () => {
    it('should preserve data through stringify -> parse cycle', () => {
      const original = { min: 5, max: 15, tags: ['test', 'example'] }
      const stringified = stringifyJsonField(original)
      const parsed = parseJsonField<typeof original>(stringified!)
      expect(parsed).toEqual(original)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
    it('merges class names correctly', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
        const showBar = false
        const showBaz = true
        expect(cn('foo', showBar && 'bar', 'baz')).toBe('foo baz')
        expect(cn('foo', showBaz && 'bar', 'baz')).toBe('foo bar baz')
    })

    it('merges tailwind classes correctly', () => {
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('handles arrays of classes', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('handles undefined and null', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('handles empty inputs', () => {
        expect(cn()).toBe('')
        expect(cn('')).toBe('')
    })
})

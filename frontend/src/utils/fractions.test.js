import { formatAmount } from './fractions'

describe('formatAmount', () => {
  it('returns empty string for null', () => {
    expect(formatAmount(null)).toBe('')
  })

  it('returns "0" for 0', () => {
    expect(formatAmount(0)).toBe('0')
  })

  it('formats 0.5 as 1/2', () => {
    expect(formatAmount(0.5)).toBe('1/2')
  })

  it('formats 1/3 as 1/3', () => {
    expect(formatAmount(1 / 3)).toBe('1/3')
  })

  it('formats 0.25 as 1/4', () => {
    expect(formatAmount(0.25)).toBe('1/4')
  })

  it('formats 0.75 as 3/4', () => {
    expect(formatAmount(0.75)).toBe('3/4')
  })

  it('formats 2/3 as 2/3', () => {
    expect(formatAmount(2 / 3)).toBe('2/3')
  })

  it('formats 0.125 as 1/8', () => {
    expect(formatAmount(0.125)).toBe('1/8')
  })

  it('combines whole number and fraction', () => {
    expect(formatAmount(2.5)).toBe('2 1/2')
  })

  it('returns whole number string for integers', () => {
    expect(formatAmount(4)).toBe('4')
    expect(formatAmount(1)).toBe('1')
  })

  it('uses 1 decimal place for amounts over 10', () => {
    expect(formatAmount(12.3)).toBe('12.3')
    expect(formatAmount(10.5)).toBe('10.5')
  })

  it('rounds amounts over 10 to 1 decimal', () => {
    expect(formatAmount(12.36)).toBe('12.4')
  })

  it('returns whole number string for large integers', () => {
    expect(formatAmount(1000)).toBe('1000')
  })
})

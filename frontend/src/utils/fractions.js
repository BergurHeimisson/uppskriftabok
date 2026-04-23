const FRACTIONS = [
  [1 / 8, '1/8'],
  [1 / 4, '1/4'],
  [1 / 3, '1/3'],
  [1 / 2, '1/2'],
  [2 / 3, '2/3'],
  [3 / 4, '3/4'],
]

export function formatAmount(amount) {
  if (amount == null) return ''
  if (amount === 0) return '0'

  if (amount > 10) {
    return (Math.round(amount * 10) / 10).toString()
  }

  const whole = Math.floor(amount)
  const decimal = amount - whole

  if (decimal < 0.01) {
    return whole.toString()
  }

  const [, fracStr] = FRACTIONS.reduce(([bestVal, bestStr], [val, str]) =>
    Math.abs(val - decimal) < Math.abs(bestVal - decimal)
      ? [val, str]
      : [bestVal, bestStr]
  )

  return whole > 0 ? `${whole} ${fracStr}` : fracStr
}

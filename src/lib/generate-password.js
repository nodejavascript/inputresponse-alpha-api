import generator from 'generate-password'

export const return4ByteKey = () => generator.generate({
  length: 32,
  numbers: true,
  lowercase: true,
  uppercase: true
})

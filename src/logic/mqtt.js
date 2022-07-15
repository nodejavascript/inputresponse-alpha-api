import isJSON from 'is-json'

import { decideToSave } from '../resolvers/mqtt'

export const onMessage = (topic, message) => {
  const payloadAsString = message && message.toString()
  const payload = isJSON(payloadAsString) ? JSON.parse(payloadAsString) : payloadAsString
  decideToSave({ topic, payload })
}

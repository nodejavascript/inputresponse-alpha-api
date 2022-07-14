import { Mqtt } from '../models'
import isJSON from 'is-json'

import { createDocument } from './'

const persistentTopics = ['tele/nodejavascriptSensorDemo/SENSOR']

export const onMessage = (topic, message) => {
  const payloadAsString = message && message.toString()
  const payload = isJSON(payloadAsString) ? JSON.parse(payloadAsString) : payloadAsString
  decideToSave({ topic, payload })
}

const decideToSave = async mqtt => {
  const { topic } = mqtt
  if (!topic || !persistentTopics.includes(topic)) return
  return createDocument(Mqtt, mqtt)
}

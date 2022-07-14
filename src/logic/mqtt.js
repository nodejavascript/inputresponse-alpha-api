import { PubSub } from 'apollo-server-express'
import { Mqtt } from '../models'
import isJSON from 'is-json'

import { createDocument } from './'

export const pubsubMqtt = new PubSub()

const persistentTopics = ['tele/nodejavascriptSensorDemo/SENSOR']

export const onMessage = (topic, message) => {
  const payloadAsString = message && message.toString()
  const payload = isJSON(payloadAsString) ? JSON.parse(payloadAsString) : payloadAsString
  decideToSave({ topic, payload })
}

const decideToSave = async data => {
  const { topic } = data
  if (!topic || !persistentTopics.includes(topic)) return

  const mqtt = await createDocument(Mqtt, data)
  pubsubMqtt.publish('MQTT_INSERTED', { sensorDataInserted: mqtt })
}

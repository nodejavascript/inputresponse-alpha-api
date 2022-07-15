import { PubSub, withFilter } from 'apollo-server-express'
import { Mqtt } from '../models'
import { findDocuments, createDocument } from '../logic'

const persistentTopics = ['tele/nodejavascriptSensorDemo/SENSOR']

const pubsubMqtt = new PubSub()

const pubsubName = 'MQTT_INSERTED'

export const decideToSave = async data => {
  const { topic } = data
  if (!topic || !persistentTopics.includes(topic)) return

  const mqtt = await createDocument(Mqtt, data)
  pubsubMqtt.publish(pubsubName, { sensorDataInserted: mqtt })
}

export default {
  Query: {
    mqtts: async (root, args, { req, res }, info) => {
      return findDocuments(Mqtt)
    }
  },
  Subscription: {
    sensorDataInserted: {
      subscribe: withFilter(
        () => pubsubMqtt.asyncIterator(['MQTT_INSERTED']),
        (payload, variables) => {
          return (payload.sensorDataInserted.topic === variables.subscriptionSensorDataInserted.topic)
        }
      )
    }
  }
}

import { withFilter } from 'apollo-server-express'
import { Mqtt } from '../models'
import { pubsubMqtt, findDocuments } from '../logic'

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
          console.log('payload', payload)
          console.log('variables', variables)
          return (payload.sensorDataInserted.topic === variables.topic)
        }
      )
    }
  }
}

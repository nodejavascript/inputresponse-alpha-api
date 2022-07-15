import { gql } from 'apollo-server-express'
import { commonToCoreQueries } from './common'

export default gql`
  extend type Query {
    mqtts: [Mqtt] @authenticated
  }

  extend type Subscription {
    sensorDataInserted (subscriptionSensorDataInserted: SubscriptionSensorDataInserted!): Mqtt
  }

  input SubscriptionSensorDataInserted {
    topic: String!
  }

  type Mqtt {
    ${commonToCoreQueries}
    topic: String
    payload: Object
  }
`

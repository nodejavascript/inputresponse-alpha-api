import { gql } from 'apollo-server-express'
import { commonToCoreQueries } from './common'

export default gql`
  extend type Query {
    mqtts: [Mqtt] @authenticated
  }

  extend type Subscription {
    sensorDataInserted (topic: String): Mqtt
  }

  type Mqtt {
    ${commonToCoreQueries}
    topic: String
    payload: Object
  }
`

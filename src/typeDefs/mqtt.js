import { gql } from 'apollo-server-express'
import { commonToCoreQueries } from './common'

export default gql`
  extend type Query {
    mqtts: [Mqtt] @authenticated
  }

  type Mqtt {
    ${commonToCoreQueries}
    topic: String
    payload: Object
  }

`

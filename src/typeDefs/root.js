import { gql } from 'apollo-server-express'

export default gql`

  scalar Object

  directive @admin on FIELD_DEFINITION # ensures authenticated automatically
  directive @authenticated on FIELD_DEFINITION
  directive @apikey on FIELD_DEFINITION
  directive @date on FIELD_DEFINITION

  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }

`

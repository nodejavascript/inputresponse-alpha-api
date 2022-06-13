import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    about: About
    healthCheck: Boolean
  }

  type About {
    name: String
    version: String
    env: String
    host: String
    origin: String
    userAgent: String
  }
`

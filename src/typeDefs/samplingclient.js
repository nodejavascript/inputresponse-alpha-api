import { gql } from 'apollo-server-express'
import { commonToCoreQueries, commonToCoreMutations } from './common'

export default gql`

  extend type Query {
    samplingClients: [SamplingClient] @authenticated
    samplingClient (querySamplingClientInput: QuerySamplingClientInput!): SamplingClient @authenticated
  }

  extend type Mutation {
    insertSamplingClient (insertSamplingClientInput: InsertSamplingClientInput!): SamplingClient @authenticated
    updateSamplingClient (updateSamplingClientInput: UpdateSamplingClientInput!): SamplingClient @authenticated
  }

  type SamplingClient {
    ${commonToCoreQueries}
    userId: String

    userAgent: Object

    modelSize: Int

    user: User
    neuralNetworks: [NeuralNetwork]
    modelSamples: [ModelSample]
  }

  input InsertSamplingClientInput {
    ${commonToCoreMutations}
    userId: ID
  }

  input UpdateSamplingClientInput {
    ${commonToCoreMutations}
    samplingclientId: ID
  }

  input QuerySamplingClientInput {
    samplingclientId: ID
  }
`

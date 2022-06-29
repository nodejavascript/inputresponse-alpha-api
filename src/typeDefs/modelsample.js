import { gql } from 'apollo-server-express'
import { commonToCoreQueries, commonToCoreMutations } from './common'

export default gql`

  extend type Query {
    modelSamples: [ModelSample] @authenticated
    modelSample (queryModelSampleInput: QueryModelSampleInput!): ModelSample @authenticated
  }

  extend type Mutation {
    insertModelSample (insertModelSampleInput: InsertModelSampleInput!): ModelSample
    updateModelSample (updateModelSampleInput: UpdateModelSampleInput!): ModelSample @authenticated
  }

  type ModelSampleIO {
    input: Object
    output: [Object]
  }

  type ModelSample {
    ${commonToCoreQueries}
    userId: String
    neuralnetworkId: String
    samplingclientId: String
    input: Object
    output: [Object]

    inputDisplay: String
    outputDisplay: String

    user: User
    neuralNetwork: NeuralNetwork
    samplingClient: SamplingClient
  }

  input InsertModelSampleInput {
    ${commonToCoreMutations}
    apiKey: String
    samplingclientId: ID
    input: Object
    output: [Object]
    skipTraining: Boolean
  }

  input UpdateModelSampleInput {
    ${commonToCoreMutations}
    modelsampleId: ID
    input: Object
    output: [Object]
  }

  input QueryModelSampleInput {
    modelsampleId: ID
  }
`

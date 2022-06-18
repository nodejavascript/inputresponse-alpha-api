import { gql } from 'apollo-server-express'
import { commonToCoreQueries, commonToCoreMutations } from './common'

export default gql`

  extend type Query {
    modelPredictions: [ModelPrediction] @authenticated
    modelPrediction (queryModelPredictionInput: QueryModelPredictionInput!): ModelPrediction @authenticated
  }

  extend type Mutation {
    insertModelPrediction (insertModelPredictionInput: InsertModelPredictionInput!): ModelPrediction
    updateModelPrediction (updateModelPredictionInput: UpdateModelPredictionInput!): ModelPrediction @authenticated
  }

  type ModelPredictionIO {
    input: Object
    output: [Object]
  }

  type ModelPrediction {
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

  input InsertModelPredictionInput {
    ${commonToCoreMutations}
    apiKey: String
    samplingclientId: ID
    input: Object
  }

  input UpdateModelPredictionInput {
    ${commonToCoreMutations}
    modelpredictionId: ID
    input: Object
  }

  input QueryModelPredictionInput {
    modelpredictionId: ID
  }
`

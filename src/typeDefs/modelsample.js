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

  type ModelSample {
    ${commonToCoreQueries}
    userId: String
    neuralnetworkId: String
    samplingclientId: String
    input: Object
    output: [Object]

    inputDisplay: String
    outputDisplay: String
    skipTraining: Boolean

    user: User
    neuralNetwork: NeuralNetwork
    samplingClient: SamplingClient
    modelpredictionId: String
    modelPrediction: ModelPrediction
  }

  input InsertModelSampleInput {
    ${commonToCoreMutations}
    apiKey: String
    samplingclientId: ID
    input: Object
    output: [Object]
    skipTraining: Boolean
    modelpredictionId: ID
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

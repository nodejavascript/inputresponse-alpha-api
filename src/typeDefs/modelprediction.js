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
    requestPrediction (requestNewApiKeyInput: RequestNewApiKeyInput!): NeuralNetwork @authenticated
  }

  type Guess {
    guess: String
    confidence: String
  }

  type ModelPrediction {
    ${commonToCoreQueries}
    userId: String
    neuralnetworkId: String
    samplingclientId: String
    traininghistoryId: String
    input: Object
    inputDisplay: String

    diagram: String
    likely: Object
    toJSON: Object
    predictionMs: Int

    guess: Object
    guesses: [Guess]
    guessFloat: Float
    guessRounded: Int

    user: User
    neuralNetwork: NeuralNetwork
    samplingClient: SamplingClient
    trainingHistory: TrainingHistory
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

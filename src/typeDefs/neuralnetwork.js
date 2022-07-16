import { gql } from 'apollo-server-express'
import { commonToCoreQueries, commonToCoreMutations } from './common'

export default gql`

  extend type Query {
    neuralNetworks: [NeuralNetwork] @authenticated
    neuralNetwork (queryNeuralNetworkInput: QueryNeuralNetworkInput!): NeuralNetwork @authenticated
  }

  extend type Mutation {
    insertNeuralNetwork (insertNeuralNetworkInput: InsertNeuralNetworkInput!): NeuralNetwork @authenticated
    updateNeuralNetwork (updateNeuralNetworkInput: UpdateNeuralNetworkInput!): NeuralNetwork @authenticated
    requestNewApiKey (requestNewApiKeyInput: RequestNewApiKeyInput!): NeuralNetwork @authenticated
    disableModelSamples (disableModelSamplesInput: DisableModelSamplesInput!): NeuralNetwork @authenticated
    trainNeuralNetwork (trainNeuralNetworkInput: TrainNeuralNetworkInput!): NeuralNetwork @authenticated
  }

  input TrainNeuralNetworkInput {
    neuralnetworkId: ID
  }

  type NeuralNetwork {
    ${commonToCoreQueries}
    userId: String

    apiKey: String
    apiKeyCreated: String @date
    apiKeyExpires: String @date
    apiKeyExpired: Boolean

    apiKeyCreatedAgo: String
    apiKeyCreatedUnix: String
    apiKeyExpiresAgo: String
    apiKeyExpiresUnix: String

    modelSize: Int

    user: User
    samplingClients: [SamplingClient]
    modelSamples: [ModelSample]

    memoryNeuralNetwork: MemoryNeuralNetwork

    lastTraininghistoryId: String
    lastTrainingHistory: TrainingHistory
    trainingHistory: [TrainingHistory]
    modelPredictions: [ModelPrediction]
  }

  input InsertNeuralNetworkInput {
    ${commonToCoreMutations}
    userId: ID
  }

  input UpdateNeuralNetworkInput {
    ${commonToCoreMutations}
    neuralnetworkId: ID
  }

  input RequestNewApiKeyInput {
    neuralnetworkId: ID
    apiKeyExpires: String
    resetApiKey: Boolean
    deleteExpiry: Boolean
  }

  input NeuralNetworkModelInput {
    neuralnetworkId: ID
  }

  input QueryNeuralNetworkInput {
    neuralnetworkId: ID
  }

  input DisableModelSamplesInput {
    neuralnetworkId: ID
  }
`

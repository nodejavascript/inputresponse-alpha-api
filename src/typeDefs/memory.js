import { gql } from 'apollo-server-express'

export default gql`

  extend type Query {
    memoryNeuralNetworksAdmin: [MemoryNeuralNetwork] @admin
    memoryNeuralNetworks: [MemoryNeuralNetwork] @authenticated
  }

  extend type Mutation {
    trainNeuralNetwork (trainNeuralNetworkInput: TrainNeuralNetworkInput!): TrainingHistory @authenticated
  }

  input TrainNeuralNetworkInput {
    neuralnetworkId: ID
  }

  type MemoryNeuralNetwork {
    neuralnetworkId: String
    modelSize: Int
    trainingMs: Int
    samplesPerSecond: Float
    createdAt: String @date
  }
`

import { gql } from 'apollo-server-express'

export default gql`

  extend type Query {
    memoryNeuralNetworksAdmin: [MemoryNeuralNetwork] @admin
    memoryNeuralNetworks: [MemoryNeuralNetwork] @authenticated
  }

  extend type Mutation {
    trainNeuralNetwork (trainNeuralNetworkInput: TrainNeuralNetworkInput!):  NeuralNetwork @authenticated
  }

  input TrainNeuralNetworkInput {
    neuralnetworkId: ID
  }

  type MemoryNeuralNetwork {
    neuralnetworkId: String
    modelSize: Int
    trainingMs: Int
    iterations: Int
    samplesPerSecond: Float
    createdAt: String @date
  }
`

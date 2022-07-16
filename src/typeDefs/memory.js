import { gql } from 'apollo-server-express'

export default gql`

  extend type Query {
    memoryNeuralNetworksAdmin: [MemoryNeuralNetwork] @admin
    memoryNeuralNetworks: [MemoryNeuralNetwork] @authenticated
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

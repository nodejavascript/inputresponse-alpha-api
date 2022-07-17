import { gql } from 'apollo-server-express'

export default gql`

  extend type Query {
    memoryNeuralNetworksAdmin: [MemoryNeuralNetwork] @admin
    memoryNeuralNetworks: [MemoryNeuralNetwork] @authenticated
  }

  type MemoryNeuralNetwork {
    neuralnetworkId: String
    isTrained: Boolean
    createdAt: String @date
    updatedAt: String @date
  }
`

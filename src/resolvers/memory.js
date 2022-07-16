import {
  returnUserNeuralNeworks,
  returnMemoryNeuralNetworks
} from '../logic'

export default {
  Query: {
    memoryNeuralNetworksAdmin: async (root, args, { req, res }, info) => {
      return returnMemoryNeuralNetworks()
    },
    memoryNeuralNetworks: async (root, args, { req, res }, info) => {
      const neuralNetworks = await returnUserNeuralNeworks(req)
      const userNeuralnetworkIds = neuralNetworks.map(n => n.id)
      return returnMemoryNeuralNetworks(userNeuralnetworkIds)
    }
  }
}

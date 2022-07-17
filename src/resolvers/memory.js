import {
  returnUserNeuralNeworks,
  returnNeuralNetworksStore
} from '../logic'

export default {
  Query: {
    memoryNeuralNetworksAdmin: async (root, args, { req, res }, info) => {
      return returnNeuralNetworksStore()
    },
    memoryNeuralNetworks: async (root, args, { req, res }, info) => {
      const neuralNetworks = await returnUserNeuralNeworks(req)
      const userNeuralnetworkIds = neuralNetworks.map(n => n.id)
      return returnNeuralNetworksStore(userNeuralnetworkIds)
    }
  }
}

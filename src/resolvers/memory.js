import {
  returnUserNeuralNeworks,
  trainMemoryNeuralNetwork,
  returnMemoryNeuralNetworks
} from '../logic'

import { validateTrainNeuralNetworkInput } from '../validation'

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
  },
  Mutation: {
    trainNeuralNetwork: async (root, args, { req, res }, info) => {
      const { trainNeuralNetworkInput } = args

      await validateTrainNeuralNetworkInput.validateAsync(trainNeuralNetworkInput, { abortEarly: false })

      const { neuralnetworkId } = trainNeuralNetworkInput

      return trainMemoryNeuralNetwork(req, neuralnetworkId, info)
    }
  }
}

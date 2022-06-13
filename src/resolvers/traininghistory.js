import { NeuralNetwork } from '../models'
import { findDocument } from '../logic'

export default {
  Query: { },
  Mutation: { },
  TrainingHistory: {
    neuralNetwork: async (trainingHistory, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = trainingHistory
      return findDocument(NeuralNetwork, { _id })
    }
  }
}

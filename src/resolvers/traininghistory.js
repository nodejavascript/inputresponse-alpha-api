import { NeuralNetwork } from '../models'
import { findDocument } from '../logic'

export default {
  Query: { },
  Mutation: { },
  TrainingHistory: {
    neuralNetwork: async (traininghistory, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = traininghistory
      return findDocument(NeuralNetwork, { _id })
    }
  }
}

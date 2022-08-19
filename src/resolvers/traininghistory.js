import { NeuralNetwork, SamplingClient, ModelSample } from '../models'
import { findDocument, findDocuments } from '../logic'

export default {
  TrainingHistory: {
    neuralNetwork: async (traininghistory, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = traininghistory
      return findDocument(NeuralNetwork, { _id })
    },
    samplingClients: async (traininghistory, args, { req, res }, info) => {
      const { samplingclientIds } = traininghistory
      return findDocuments(SamplingClient, { _id: { $in: samplingclientIds } })
    },
    modelSamples: async (traininghistory, args, { req, res }, info) => {
      const { modelsampleIds } = traininghistory
      return findDocuments(ModelSample, { _id: modelsampleIds })
    }
  }
}

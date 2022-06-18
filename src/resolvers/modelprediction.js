import { User, NeuralNetwork, SamplingClient, ModelPrediction } from '../models'
import { validateInsertModelPredictionInput, validateUpdateModelPredictionInput, validateQueryModelPredictionInput } from '../validation'
import { returnTrustedUser, findDocuments, findDocument, updateDocument } from '../logic'
import { returnEnabedUserNeuralNetwork } from './neuralnetwork'
import { trainMemoryNeuralNetwork } from './memory'

const returnEnabledUserModelPrediction = async (req, _id) => {
  const query = { _id }
  const [modelprediction] = await Promise.all([
    findDocument(ModelPrediction, query),
    ModelPrediction.ensureEnabed(query)
  ])

  const { neuralnetworkId } = modelprediction
  await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

  return modelprediction
}

export default {
  Query: {
    modelPredictions: async (root, args, { req, res }, info) => {
      const { id: userId } = await returnTrustedUser(req)
      return findDocuments(ModelPrediction, { userId })
    },
    modelPrediction: async (root, args, { req, res }, info) => {
      const { queryModelPredictionInput } = args

      await validateQueryModelPredictionInput.validateAsync(queryModelPredictionInput, { abortEarly: false })

      const { modelpredictionId } = queryModelPredictionInput

      return returnEnabledUserModelPrediction(req, modelpredictionId)
    }
  },
  Mutation: {
    insertModelPrediction: async (root, args, { req, res }, info) => {
      const { insertModelPredictionInput } = args

      await validateInsertModelPredictionInput.validateAsync(insertModelPredictionInput, { abortEarly: false })
      return true
    },
    updateModelPrediction: async (root, args, { req, res }, info) => {
      const { updateModelPredictionInput } = args

      await validateUpdateModelPredictionInput.validateAsync(updateModelPredictionInput, { abortEarly: false })
      const { modelpredictionId } = updateModelPredictionInput

      await returnEnabledUserModelPrediction(req, modelpredictionId)

      const modelprediction = await updateDocument(ModelPrediction, modelpredictionId, updateModelPredictionInput)

      const { neuralnetworkId, enabled } = modelprediction
      enabled && await trainMemoryNeuralNetwork(req, neuralnetworkId)

      return modelprediction
    }
  },
  ModelPrediction: {
    user: async (modelPrediction, args, { req, res }, info) => {
      const { neuralnetworkId } = modelPrediction
      const { userId: _id } = await findDocument(NeuralNetwork, { _id: neuralnetworkId })
      return findDocument(User, { _id })
    },
    neuralNetwork: async (modelPrediction, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = modelPrediction
      return findDocument(NeuralNetwork, { _id })
    },
    samplingClient: async (modelPrediction, args, { req, res }, info) => {
      const { samplingclientId: _id } = modelPrediction
      return findDocument(SamplingClient, { _id })
    }
  }
}

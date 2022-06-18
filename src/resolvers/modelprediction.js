import { User, NeuralNetwork, SamplingClient, ModelPrediction } from '../models'
import { validateInsertModelPredictionInput, validateUpdateModelPredictionInput, validateQueryModelPredictionInput } from '../validation'
import { validateApiSubmission, returnTrustedUser, findDocuments, createDocument, findDocument, updateDocument } from '../logic'
import { returnEnabedUserNeuralNetwork } from './neuralnetwork'
import { trainMemoryNeuralNetwork, returnPredictionMemoryNeuralNetwork } from './memory'

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
      // console.log('insertModelPredictionInput', insertModelPredictionInput)
      await validateInsertModelPredictionInput.validateAsync(insertModelPredictionInput, { abortEarly: false })

      const newRecord = await validateApiSubmission(req, insertModelPredictionInput)

      const modelprediction = await createDocument(ModelPrediction, newRecord)

      return modelprediction
    },
    updateModelPrediction: async (root, args, { req, res }, info) => {
      const { updateModelPredictionInput } = args

      await validateUpdateModelPredictionInput.validateAsync(updateModelPredictionInput, { abortEarly: false })

      const { modelpredictionId } = updateModelPredictionInput

      // solves bug in brainJS, because it can't parse [Object: null prototype] { r: 1, g: 200, b: 210 }
      const input = JSON.parse(JSON.stringify(updateModelPredictionInput.input))

      await returnEnabledUserModelPrediction(req, modelpredictionId)

      const modelpredictionPretrained = await updateDocument(ModelPrediction, modelpredictionId, { input })

      const { neuralnetworkId, enabled } = modelpredictionPretrained

      if (!enabled) return modelpredictionPretrained

      await trainMemoryNeuralNetwork(req, neuralnetworkId)

      const prediction = await returnPredictionMemoryNeuralNetwork({ neuralnetworkId, input })

      const modelprediction = await updateDocument(ModelPrediction, modelpredictionId, prediction)

      return modelprediction
    }
  },
  ModelPrediction: {
    user: async (modelprediction, args, { req, res }, info) => {
      const { neuralnetworkId } = modelprediction
      const { userId: _id } = await findDocument(NeuralNetwork, { _id: neuralnetworkId })
      return findDocument(User, { _id })
    },
    neuralNetwork: async (modelprediction, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = modelprediction
      return findDocument(NeuralNetwork, { _id })
    },
    samplingClient: async (modelprediction, args, { req, res }, info) => {
      const { samplingclientId: _id } = modelprediction
      return findDocument(SamplingClient, { _id })
    }
  }
}

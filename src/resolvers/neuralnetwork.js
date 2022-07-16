import { User, NeuralNetwork, SamplingClient, ModelSample, TrainingHistory, ModelPrediction } from '../models'
import {
  returnTrustedUser,
  deleteCacheUserNN,
  findDocuments,
  createDocument,
  updateDocument,
  findDocument,
  updateDocuments,
  returnEnabedUserNeuralNetwork,
  returnUserNeuralNeworks,
  returnMemoryNeuralNetwork,
  returnUserNeuralNeworkModel
} from '../logic'

import { dayjsDefaultFormat, return4ByteKey, checkExpired } from '../lib'
import {
  validateInsertNeuralNetworkInput,
  validateUpdateNeuralNetworkInput,
  validateRequestNewApiKeyInput,
  validateNeuralNetworkModelInput,
  validateQueryNeuralNetworkInput,
  validateDisableModelSamplesInput
} from '../validation'

export const returnApiKeyExpired = neuralnetwork => {
  const { apiKeyCreated, apiKeyExpires } = neuralnetwork
  if (!apiKeyCreated) return true
  if (!apiKeyExpires) return false
  return checkExpired(apiKeyExpires)
}

const returnNewApiKey = apiKeyExpires => return4ByteKey()

export default {
  Query: {
    neuralNetworks: async (root, args, { req, res }, info) => {
      return returnUserNeuralNeworks(req)
    },
    neuralNetwork: async (root, args, { req, res }, info) => {
      const { queryNeuralNetworkInput } = args

      await validateQueryNeuralNetworkInput.validateAsync(queryNeuralNetworkInput, { abortEarly: false })

      const { neuralnetworkId } = queryNeuralNetworkInput

      return returnEnabedUserNeuralNetwork(req, neuralnetworkId)
    },
    neuralNetworkModel: async (root, args, { req, res }, info) => {
      const { neuralNetworkModelInput } = args

      await validateNeuralNetworkModelInput.validateAsync(neuralNetworkModelInput, { abortEarly: false })

      const { neuralnetworkId } = neuralNetworkModelInput

      const [{ userId }, { model }] = await Promise.all([
        returnEnabedUserNeuralNetwork(req, neuralnetworkId),
        returnUserNeuralNeworkModel(neuralnetworkId)
      ])

      return { neuralnetworkId, userId, model }
    }
  },
  Mutation: {
    insertNeuralNetwork: async (root, args, { req, res }, info) => {
      const { insertNeuralNetworkInput } = args

      const { id: userId } = await returnTrustedUser(req)

      insertNeuralNetworkInput.userId = userId

      const { name } = insertNeuralNetworkInput
      if (!name) insertNeuralNetworkInput.name = `Created: ${dayjsDefaultFormat(new Date())}`

      await validateInsertNeuralNetworkInput.validateAsync(insertNeuralNetworkInput, { abortEarly: false })

      const apiKey = returnNewApiKey()
      const apiKeyCreated = new Date()

      return createDocument(NeuralNetwork, { ...insertNeuralNetworkInput, apiKey, apiKeyCreated })
    },
    updateNeuralNetwork: async (root, args, { req, res }, info) => {
      const { updateNeuralNetworkInput } = args

      await validateUpdateNeuralNetworkInput.validateAsync(updateNeuralNetworkInput, { abortEarly: false })

      const { neuralnetworkId } = updateNeuralNetworkInput

      await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

      return updateDocument(NeuralNetwork, neuralnetworkId, updateNeuralNetworkInput)
    },
    disableModelSamples: async (root, args, { req, res }, info) => {
      const { disableModelSamplesInput } = args

      await validateDisableModelSamplesInput.validateAsync(disableModelSamplesInput, { abortEarly: false })

      const { neuralnetworkId } = disableModelSamplesInput

      const neuralnetwork = await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

      await updateDocuments(ModelSample, { neuralnetworkId, enabled: true }, { enabled: false })

      return neuralnetwork
    },
    requestNewApiKey: async (root, args, { req, res }, info) => {
      const { requestNewApiKeyInput } = args

      await validateRequestNewApiKeyInput.validateAsync(requestNewApiKeyInput, { abortEarly: false })

      const { neuralnetworkId, resetApiKey, deleteExpiry } = requestNewApiKeyInput

      const neuralnetwork = await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

      const { apiKey } = neuralnetwork

      await deleteCacheUserNN(apiKey)

      const apiKeyExpires = deleteExpiry ? null : requestNewApiKeyInput.apiKeyExpires

      const update = { apiKeyExpires }

      if (resetApiKey) {
        update.apiKey = returnNewApiKey()
        update.apiKeyCreated = new Date()
      }

      return updateDocument(NeuralNetwork, neuralnetworkId, update)
    }
  },
  NeuralNetwork: {
    user: async (neuralnetwork, args, { req, res }, info) => {
      const { userId: _id } = neuralnetwork
      return findDocument(User, { _id })
    },
    samplingClients: async (neuralnetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralnetwork
      const modelSamples = await findDocuments(ModelSample, { neuralnetworkId, enabled: true })
      return findDocuments(SamplingClient, { _id: { $in: modelSamples.map(i => i.samplingclientId) } })
    },
    modelSamples: async (neuralnetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralnetwork
      return findDocuments(ModelSample, { neuralnetworkId, enabled: true })
    },
    memoryNeuralNetwork: (neuralnetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralnetwork
      return returnMemoryNeuralNetwork(neuralnetworkId)
    },
    lastTrainingHistory: async (neuralnetwork, args, { req, res }, info) => {
      const { lastTraininghistoryId: _id } = neuralnetwork
      return findDocument(TrainingHistory, { _id })
    },
    trainingHistory: async (neuralnetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralnetwork
      return findDocuments(TrainingHistory, { neuralnetworkId })
    },
    modelPredictions: async (neuralnetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralnetwork
      return findDocuments(ModelPrediction, { neuralnetworkId, enabled: true })
    }
  }
}

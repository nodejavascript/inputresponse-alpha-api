import { User, NeuralNetwork, SamplingClient, ModelSample, TrainingHistory } from '../models'
import { validateInsertNeuralNetworkInput, validateUpdateNeuralNetworkInput, validateRequestNewApiKeyInput, validateNeuralNetworkModelInput, validateQueryNeuralNetworkInput } from '../validation'
import { returnTrustedUser, deleteCacheUserNN, findDocuments, createDocument, updateDocument, findDocument } from '../logic'
import { dayjsDefaultFormat, return4ByteKey, checkExpired } from '../lib'
import { returnMemoryNeuralNetwork } from './memory'

export const returnApiKeyExpired = neuralnetwork => {
  const { apiKeyCreated, apiKeyExpires } = neuralnetwork
  if (!apiKeyCreated) return true
  if (!apiKeyExpires) return false
  return checkExpired(apiKeyExpires)
}

export const returnEnabedUserNeuralNetwork = async (req, _id) => {
  const { id: userId } = await returnTrustedUser(req)
  const query = { _id, userId }

  const [neuralnetwork] = await Promise.all([
    findDocument(NeuralNetwork, query),
    NeuralNetwork.ensureEnabed(query)
  ])

  return neuralnetwork
}

const returnNewApiKey = apiKeyExpires => return4ByteKey()

export const returnUserNeuralNeworks = async req => {
  const { id: userId } = await returnTrustedUser(req)
  return findDocuments(NeuralNetwork, { userId })
}

export const returnUserNeuralNeworkModel = async neuralnetworkId => {
  const modelsamples = await findDocuments(ModelSample, { neuralnetworkId }, 'input output')
  return modelsamples.map(({ input, output }) => ({ input, output }))
}

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

      const [{ userId }, model] = await Promise.all([
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
    requestNewApiKey: async (root, args, { req, res }, info) => {
      const { requestNewApiKeyInput } = args

      await validateRequestNewApiKeyInput.validateAsync(requestNewApiKeyInput, { abortEarly: false })

      const { neuralnetworkId, resetApiKey, deleteExpiry } = requestNewApiKeyInput

      const neuralnetwork = await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

      const { apiKey } = neuralnetwork

      if (apiKey) {
        await deleteCacheUserNN(apiKey)
      }

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
    user: async (neuralNetwork, args, { req, res }, info) => {
      const { userId: _id } = neuralNetwork
      return findDocument(User, { _id })
    },
    samplingClients: async (neuralNetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralNetwork
      const modelSamples = await findDocuments(ModelSample, { neuralnetworkId })
      return findDocuments(SamplingClient, { _id: { $in: modelSamples.map(i => i.samplingclientId) } })
    },
    modelSamples: async (neuralNetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralNetwork
      return findDocuments(ModelSample, { neuralnetworkId })
    },
    memoryNeuralNetwork: (neuralNetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralNetwork
      return returnMemoryNeuralNetwork(neuralnetworkId)
    },
    trainingHistory: async (neuralNetwork, args, { req, res }, info) => {
      const { id: neuralnetworkId } = neuralNetwork
      return findDocuments(TrainingHistory, { neuralnetworkId })
    }
  }
}

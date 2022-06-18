import { User, NeuralNetwork, SamplingClient, ModelSample } from '../models'
import { validateInsertSamplingClientInput, validateUpdateSamplingClientInput, validateQuerySamplingClientInput } from '../validation'
import { returnTrustedUser, deleteCacheSamplingClient, findDocuments, createDocument, updateDocument, findDocument } from '../logic'
import { dayjsDefaultFormat } from '../lib'

const returnEnabledUserSamplingClient = async (req, _id) => {
  const { id: userId } = await returnTrustedUser(req)
  const query = { _id, userId }
  const [samplingclient] = await Promise.all([
    findDocument(SamplingClient, query),
    SamplingClient.ensureEnabed(query)
  ])

  return samplingclient
}

export default {
  Query: {
    samplingClients: async (root, args, { req, res }, info) => {
      const { id: userId } = await returnTrustedUser(req)
      return findDocuments(SamplingClient, { userId })
    },
    samplingClient: async (root, args, { req, res }, info) => {
      const { querySamplingClientInput } = args

      await validateQuerySamplingClientInput.validateAsync(querySamplingClientInput, { abortEarly: false })

      const { samplingclientId } = querySamplingClientInput

      return returnEnabledUserSamplingClient(req, samplingclientId)
    }
  },
  Mutation: {
    insertSamplingClient: async (root, args, { req, res }, info) => {
      const { insertSamplingClientInput } = args

      const { id: userId } = await returnTrustedUser(req)

      insertSamplingClientInput.userId = userId

      const { name } = insertSamplingClientInput
      if (!name) insertSamplingClientInput.name = `Created: ${dayjsDefaultFormat(new Date())}`

      await validateInsertSamplingClientInput.validateAsync(insertSamplingClientInput, { abortEarly: false })

      insertSamplingClientInput.userAgent = req.headers['user-agent']

      return createDocument(SamplingClient, insertSamplingClientInput)
    },
    updateSamplingClient: async (root, args, { req, res }, info) => {
      const { updateSamplingClientInput } = args

      await validateUpdateSamplingClientInput.validateAsync(updateSamplingClientInput, { abortEarly: false })

      const { samplingclientId } = updateSamplingClientInput

      await returnEnabledUserSamplingClient(req, samplingclientId)

      deleteCacheSamplingClient(samplingclientId)

      return updateDocument(SamplingClient, samplingclientId, updateSamplingClientInput)
    }
  },
  SamplingClient: {
    user: async (samplingclient, args, { req, res }, info) => {
      const { userId: _id } = samplingclient
      return findDocument(User, { _id })
    },
    neuralNetworks: async (samplingclient, args, { req, res }, info) => {
      const { id: samplingclientId } = samplingclient
      const modelSamples = await findDocuments(ModelSample, { samplingclientId })
      return findDocuments(NeuralNetwork, { _id: { $in: modelSamples.map(i => i.neuralnetworkId) } })
    },
    modelSamples: async (samplingclient, args, { req, res }, info) => {
      const { id: samplingclientId } = samplingclient
      return findDocuments(ModelSample, { samplingclientId })
    }
  }
}

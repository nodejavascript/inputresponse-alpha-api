import { User, NeuralNetwork, SamplingClient, ModelSample } from '../models'
import { validateApiSubmission, returnTrustedUser, findDocuments, createDocument, findDocument, updateDocument, returnUserNeuralNetwork, trainMemoryNeuralNetwork } from '../logic'
import { validateInsertModelSampleInput, validateUpdateModelSampleInput, validateQueryModelSampleInput } from '../validation'

const returnEnabledUserModelSample = async (req, _id) => {
  const query = { _id }
  const [modelsample] = await Promise.all([
    findDocument(ModelSample, query),
    ModelSample.ensureEnabed(query)
  ])

  const { neuralnetworkId } = modelsample
  await returnUserNeuralNetwork(req, neuralnetworkId)

  return modelsample
}

export default {
  Query: {
    modelSamples: async (root, args, { req, res }, info) => {
      const { id: userId } = await returnTrustedUser(req)
      return findDocuments(ModelSample, { userId })
    },
    modelSample: async (root, args, { req, res }, info) => {
      const { queryModelSampleInput } = args

      await validateQueryModelSampleInput.validateAsync(queryModelSampleInput, { abortEarly: false })

      const { modelsampleId } = queryModelSampleInput

      return returnEnabledUserModelSample(req, modelsampleId)
    }
  },
  Mutation: {
    insertModelSample: async (root, args, { req, res }, info) => {
      const { insertModelSampleInput } = args

      await validateInsertModelSampleInput.validateAsync(insertModelSampleInput, { abortEarly: false })

      const newRecord = await validateApiSubmission(req, insertModelSampleInput)

      const modelsample = await createDocument(ModelSample, newRecord)

      const { neuralnetworkId, enabled } = modelsample
      const { skipTraining } = insertModelSampleInput

      !skipTraining && enabled && await trainMemoryNeuralNetwork(req, neuralnetworkId, info)

      return modelsample
    },
    updateModelSample: async (root, args, { req, res }, info) => {
      const { updateModelSampleInput } = args

      await validateUpdateModelSampleInput.validateAsync(updateModelSampleInput, { abortEarly: false })
      const { modelsampleId } = updateModelSampleInput

      await returnEnabledUserModelSample(req, modelsampleId)

      const modelsample = await updateDocument(ModelSample, modelsampleId, updateModelSampleInput)

      const { neuralnetworkId, enabled } = modelsample
      enabled && await trainMemoryNeuralNetwork(req, neuralnetworkId, info)

      return modelsample
    }
  },
  ModelSample: {
    user: async (modelsample, args, { req, res }, info) => {
      const { neuralnetworkId } = modelsample
      const { userId: _id } = await findDocument(NeuralNetwork, { _id: neuralnetworkId })
      return findDocument(User, { _id })
    },
    neuralNetwork: async (modelsample, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = modelsample
      return findDocument(NeuralNetwork, { _id })
    },
    samplingClient: async (modelsample, args, { req, res }, info) => {
      const { samplingclientId: _id } = modelsample
      return findDocument(SamplingClient, { _id })
    }
  }
}

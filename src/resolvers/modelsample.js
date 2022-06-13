import { User, NeuralNetwork, SamplingClient, ModelSample } from '../models'
import { validateInsertModelSampleInput, validateUpdateModelSampleInput, validateQueryModelSampleInput } from '../validation'
import { returnNewModelSample, returnTrustedUser, findDocuments, createDocument, findDocument, updateDocument } from '../logic'
import { returnValidUserNeuralNetwork } from './neuralnetwork'

const returnValidUserModelSample = async (req, _id) => {
  const query = { _id }
  const [modelsample] = await Promise.all([
    findDocument(ModelSample, query),
    ModelSample.ensureValid(query)
  ])

  const { neuralnetworkId } = modelsample
  await returnValidUserNeuralNetwork(req, neuralnetworkId)

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

      return returnValidUserModelSample(req, modelsampleId)
    }
  },
  Mutation: {
    insertModelSample: async (root, args, { req, res }, info) => {
      const { insertModelSampleInput } = args

      await validateInsertModelSampleInput.validateAsync(insertModelSampleInput, { abortEarly: false })

      const modelSample = await returnNewModelSample(req, insertModelSampleInput)

      return createDocument(ModelSample, modelSample)
    },
    updateModelSample: async (root, args, { req, res }, info) => {
      const { updateModelSampleInput } = args

      await validateUpdateModelSampleInput.validateAsync(updateModelSampleInput, { abortEarly: false })
      const { modelsampleId } = updateModelSampleInput

      await returnValidUserModelSample(req, modelsampleId)

      return updateDocument(ModelSample, modelsampleId, updateModelSampleInput)
    }
  },
  ModelSample: {
    user: async (modelSample, args, { req, res }, info) => {
      const { neuralnetworkId } = modelSample
      const { userId: _id } = await findDocument(NeuralNetwork, { _id: neuralnetworkId })
      return findDocument(User, { _id })
    },
    neuralNetwork: async (modelSample, args, { req, res }, info) => {
      const { neuralnetworkId: _id } = modelSample
      return findDocument(NeuralNetwork, { _id })
    },
    samplingClient: async (modelSample, args, { req, res }, info) => {
      const { samplingclientId: _id } = modelSample
      return findDocument(SamplingClient, { _id })
    }
  }
}

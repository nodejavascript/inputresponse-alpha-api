import { User, NeuralNetwork, SamplingClient, ModelSample } from '../models'
import { validateInsertModelSampleInput, validateUpdateModelSampleInput, validateQueryModelSampleInput } from '../validation'
import { returnNewModelSample, returnTrustedUser, findDocuments, createDocument, findDocument, updateDocument } from '../logic'
import { returnEnabedUserNeuralNetwork } from './neuralnetwork'

const returnEnabledUserModelSample = async (req, _id) => {
  const query = { _id }
  const [modelsample] = await Promise.all([
    findDocument(ModelSample, query),
    ModelSample.ensureEnabed(query)
  ])

  const { neuralnetworkId } = modelsample
  await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

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

      const modelSample = await returnNewModelSample(req, insertModelSampleInput)

      // !!NEXT - if same is enabled, re train model and provide AI `guess`, `run`, svg, etc...
      return createDocument(ModelSample, modelSample)
    },
    updateModelSample: async (root, args, { req, res }, info) => {
      const { updateModelSampleInput } = args

      await validateUpdateModelSampleInput.validateAsync(updateModelSampleInput, { abortEarly: false })
      const { modelsampleId } = updateModelSampleInput

      await returnEnabledUserModelSample(req, modelsampleId)

      // do not automatically train

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

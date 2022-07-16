import { User, NeuralNetwork, SamplingClient, ModelPrediction, TrainingHistory } from '../models'
import {
  validateApiSubmission,
  returnTrustedUser,
  findDocuments,
  createDocument,
  findDocument,
  updateDocument,
  returnEnabedUserNeuralNetwork,
  trainMemoryNeuralNetwork,
  returnPredictionMemoryNeuralNetwork
} from '../logic'

import { validateInsertModelPredictionInput, validateUpdateModelPredictionInput, validateQueryModelPredictionInput } from '../validation'

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
    // need mqtt version
    insertModelPrediction: async (root, args, { req, res }, info) => {
      console.log('need mqtt version of insertModelPrediction')
      const { insertModelPredictionInput } = args

      await validateInsertModelPredictionInput.validateAsync(insertModelPredictionInput, { abortEarly: false })

      const newRecord = await validateApiSubmission(req, insertModelPredictionInput)

      const { id: modelpredictionId, neuralnetworkId, input } = await createDocument(ModelPrediction, newRecord)

      return returnPredictionMemoryNeuralNetwork(req, { modelpredictionId, input, neuralnetworkId }, info)
    },
    updateModelPrediction: async (root, args, { req, res }, info) => {
      const { updateModelPredictionInput } = args

      await validateUpdateModelPredictionInput.validateAsync(updateModelPredictionInput, { abortEarly: false })

      const { modelpredictionId, input } = updateModelPredictionInput

      await returnEnabledUserModelPrediction(req, modelpredictionId)

      const { neuralnetworkId } = await updateDocument(ModelPrediction, modelpredictionId, { input })

      // left here for later. do not train if already trained? this could be diff conditions than aboce (insert). tthis is why its updated before and after training (if necessary)
      const neuralnetwork = await trainMemoryNeuralNetwork(req, neuralnetworkId, info)

      return returnPredictionMemoryNeuralNetwork({ modelpredictionId, input, neuralnetwork })
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
    },
    trainingHistory: async (modelprediction, args, { req, res }, info) => {
      const { traininghistoryId: _id } = modelprediction
      return findDocument(TrainingHistory, { _id })
    }
  }
}

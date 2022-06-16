import { UserInputError } from 'apollo-server-express'
import * as brain from 'brain.js'

import { NeuralNetwork, TrainingHistory } from '../models'
import { validateTrainNeuralNetworkInput } from '../validation'
import { getTickCount } from '../lib'
import { updateDocument, createDocument } from '../logic'
// import { returnTrustedUser, deleteCacheUserNN, findDocuments, createDocument, updateDocument, findDocument } from '../logic'
import { returnUserNeuralNeworks, returnEnabedUserNeuralNetwork, returnUserNeuralNeworkModel } from './neuralnetwork'

const memoryNeuralNetworks = []

export const returnMemoryNeuralNetwork = neuralnetworkId => {
  return memoryNeuralNetworks.find(i => i.neuralnetworkId === neuralnetworkId.toString())
}

const updateMemoryNeuralNetwork = (neuralnetworkId, memoryNeuralNetwork) => {
  const index = memoryNeuralNetworks.findIndex(i => i.neuralnetworkId === neuralnetworkId.toString())

  memoryNeuralNetworks[index] = memoryNeuralNetwork
}

const trainMemoryNeuralNetwork = async (req, neuralnetworkId) => {
  const memoryNeuralNetwork = returnMemoryNeuralNetwork(neuralnetworkId)

  if (!memoryNeuralNetwork) throw new UserInputError('Neural Network is not memorized.')

  const model = await returnUserNeuralNeworkModel(neuralnetworkId)

  const modelSize = model.length
  if (model.length === 0) throw new UserInputError('Model can not be trained without data.')

  const item = model[0]
  const inputSize = item.input.length
  const inputRange = item.input.length
  const outputSize = item.input.length

  // hiddenLayers: [4, 6, 5],
  // activation: 'sigmoid', // activation function

  memoryNeuralNetwork.options = { inputSize, inputRange, outputSize }

  const start = getTickCount()

  await memoryNeuralNetwork.net.trainAsync(model)
  const trainingMs = getTickCount() - start

  const samplesPerSecond = modelSize / (trainingMs / 1000)

  const trainingHistory = { neuralnetworkId, modelSize, trainingMs, samplesPerSecond }

  const update = {
    ...memoryNeuralNetwork,
    ...trainingHistory
  }

  updateMemoryNeuralNetwork(neuralnetworkId, update)

  await updateDocument(NeuralNetwork, neuralnetworkId, { lastTrainingHistory: trainingHistory })

  return createDocument(TrainingHistory, trainingHistory)
}

export default {
  Query: {
    memoryNeuralNetworksAdmin: async (root, args, { req, res }, info) => {
      return memoryNeuralNetworks
    },
    memoryNeuralNetworks: async (root, args, { req, res }, info) => {
      const neuralNetworks = await returnUserNeuralNeworks(req)
      const neuralnetworkIds = neuralNetworks.map(n => n.id)
      return memoryNeuralNetworks.filter(i => neuralnetworkIds.toString().includes(i.neuralnetworkId.toString()))
    }
  },
  Mutation: {
    trainNeuralNetwork: async (root, args, { req, res }, info) => {
      const { trainNeuralNetworkInput } = args

      await validateTrainNeuralNetworkInput.validateAsync(trainNeuralNetworkInput, { abortEarly: false })

      const { neuralnetworkId } = trainNeuralNetworkInput

      const neuralnetwork = await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

      const modelSize = await neuralnetwork.modelSize

      if (modelSize === 0) throw new UserInputError('Model can not be trained without data.')

      let memoryNeuralNetwork = returnMemoryNeuralNetwork(neuralnetworkId)

      // add to memory if not there already
      // should time these out if memory not used
      if (!memoryNeuralNetwork) {
        const net = new brain.NeuralNetwork()
        const createdAt = new Date()

        memoryNeuralNetwork = {
          neuralnetworkId,
          net,
          createdAt
        }

        memoryNeuralNetworks.push(memoryNeuralNetwork)
      }

      return trainMemoryNeuralNetwork(req, neuralnetworkId)
    }
  }
}

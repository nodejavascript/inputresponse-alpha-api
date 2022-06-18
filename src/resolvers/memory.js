import { UserInputError } from 'apollo-server-express'
import * as brain from 'brain.js'

import { NeuralNetwork, TrainingHistory } from '../models'
import { validateTrainNeuralNetworkInput } from '../validation'
import { getTickCount, uniqArray } from '../lib'
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

export const trainMemoryNeuralNetwork = async (req, neuralnetworkId) => {
  await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

  const memoryNeuralNetwork = createOrReturnMemoryNeuralNetwork(neuralnetworkId)

  const { model, meta } = await returnUserNeuralNeworkModel(neuralnetworkId)

  const modelsampleIds = uniqArray(meta.map(i => i.id))
  const samplingclientIds = uniqArray(meta.map(i => i.samplingclientId))

  const modelSize = model.length
  if (model.length === 0) throw new UserInputError('Model can not be trained without a sample.')

  const firstSample = model[0]
  if (!firstSample.input || !firstSample.output) throw new UserInputError(`First sample missing params:${JSON.stringify(firstSample)}`)

  const inputSize = Object.keys(firstSample.input).length
  const inputRange = Object.keys(firstSample.input).length
  const outputSize = firstSample.output.length

  memoryNeuralNetwork.options = { inputSize, inputRange, outputSize }

  // hiddenLayers: [4, 6, 5],
  // activation: 'sigmoid', // activation function

  const start = getTickCount()

  const trainingResponse = await memoryNeuralNetwork.net.trainAsync(model)
  const trainingMs = getTickCount() - start

  const samplesPerSecond = modelSize / (trainingMs / 1000)
  //
  const trainingHistory = { ...trainingResponse, neuralnetworkId, modelsampleIds, samplingclientIds, modelSize, inputSize, inputRange, outputSize, trainingMs, samplesPerSecond }

  const update = {
    ...memoryNeuralNetwork,
    ...trainingHistory
  }

  updateMemoryNeuralNetwork(neuralnetworkId, update)

  const [neuralnetwork] = await Promise.all([
    updateDocument(NeuralNetwork, neuralnetworkId, { lastTrainingHistory: trainingHistory }),
    createDocument(TrainingHistory, trainingHistory)
  ])

  return neuralnetwork
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

      return trainMemoryNeuralNetwork(req, neuralnetworkId)
    }
  }
}

const createOrReturnMemoryNeuralNetwork = neuralnetworkId => {
  const existing = returnMemoryNeuralNetwork(neuralnetworkId)
  if (existing) return existing

  const net = new brain.NeuralNetwork()
  const createdAt = new Date()

  const memoryNeuralNetwork = {
    neuralnetworkId,
    net,
    createdAt
  }

  memoryNeuralNetworks.push(memoryNeuralNetwork)

  return memoryNeuralNetwork
}

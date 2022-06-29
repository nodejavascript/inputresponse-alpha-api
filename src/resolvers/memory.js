import { UserInputError } from 'apollo-server-express'
import * as brain from 'brain.js'
// import jsonEqual from 'node-json-equal' save this for deciding if we should train an updated prediction request

import { NeuralNetwork, TrainingHistory, ModelPrediction } from '../models'
import { validateTrainNeuralNetworkInput } from '../validation'
import { getTickCount, uniqArray } from '../lib'
import { updateDocument, createDocument } from '../logic'
import { returnUserNeuralNeworks, returnEnabedUserNeuralNetwork, returnUserNeuralNeworkModel } from './neuralnetwork'

const memoryNeuralNetworks = []

export const returnMemoryNeuralNetwork = neuralnetworkId => {
  return memoryNeuralNetworks.find(i => i.neuralnetworkId === neuralnetworkId.toString())
}

const updateMemoryNeuralNetwork = (neuralnetworkId, net, options = { }) => {
  const index = memoryNeuralNetworks.findIndex(i => i.neuralnetworkId === neuralnetworkId.toString())

  const existing = memoryNeuralNetworks[index]

  const createdAt = new Date()

  memoryNeuralNetworks[index] = {
    ...existing,
    ...options,
    ...net,
    createdAt
  }
}

export const returnPredictionMemoryNeuralNetwork = async (req, { modelpredictionId, input: inputWithBrainJSBug, neuralnetworkId }, info) => {
  // solves bug in brainJS, because it can't parse [Object: null prototype] { r: 1, g: 200, b: 210 }
  const input = JSON.parse(JSON.stringify(inputWithBrainJSBug))

  const { net } = createOrReturnMemoryNeuralNetwork(neuralnetworkId)

  const isTrained = memoryNeuralNetworkIsTrained(net)
  !isTrained && await trainMemoryNeuralNetwork(req, neuralnetworkId, info)

  const start = getTickCount()
  const [diagram, likely, guess, toJSON] = await Promise.all([
    brain.utilities.toSVG(net),
    brain.likely(input, net),
    net.run(input),
    net.toJSON()
  ])
  const predictionMs = getTickCount() - start

  console.log('Neural Network predicted', predictionMs, 'ms')

  // record already updated with good input format
  return updateDocument(ModelPrediction, modelpredictionId, { diagram, likely, guess, toJSON, predictionMs })
}

export const trainMemoryNeuralNetwork = async (req, neuralnetworkId, info = { }) => {
  console.time('returnEnabedUserNeuralNetwork')
  await returnEnabedUserNeuralNetwork(req, neuralnetworkId)
  console.timeEnd('returnEnabedUserNeuralNetwork')

  console.time('createOrReturnMemoryNeuralNetwork')
  const memoryNeuralNetwork = createOrReturnMemoryNeuralNetwork(neuralnetworkId)
  console.timeEnd('createOrReturnMemoryNeuralNetwork')

  console.time('returnUserNeuralNeworkModel')
  const { model, meta } = await returnUserNeuralNeworkModel(neuralnetworkId)
  console.timeEnd('returnUserNeuralNeworkModel')

  console.log('model', model)

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

  const samplesPerSecond = trainingMs ? modelSize / (trainingMs / 1000) : 0

  const { path: operation } = info

  const trainingHistory = {
    ...trainingResponse,
    neuralnetworkId,
    modelsampleIds,
    samplingclientIds,
    inputSize,
    inputRange,
    outputSize,
    operation,
    trainingMs,
    samplesPerSecond,
    modelSize
  }

  updateMemoryNeuralNetwork(neuralnetworkId, memoryNeuralNetwork.net, trainingHistory)

  const { id: lastTraininghistoryId } = await createDocument(TrainingHistory, trainingHistory)

  return updateDocument(NeuralNetwork, neuralnetworkId, { lastTraininghistoryId })
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

      return trainMemoryNeuralNetwork(req, neuralnetworkId, info)
    }
  }
}

const createOrReturnMemoryNeuralNetwork = neuralnetworkId => {
  const existing = returnMemoryNeuralNetwork(neuralnetworkId)
  if (existing) return existing

  const net = new brain.NeuralNetwork()
  const createdAt = new Date()

  const memoryNeuralNetwork = {
    neuralnetworkId: neuralnetworkId.toString(),
    net,
    createdAt
  }

  memoryNeuralNetworks.push(memoryNeuralNetwork)

  return memoryNeuralNetwork
}

export const memoryNeuralNetworkIsTrained = net => {
  try {
    net.toJSON()
    return true
  } catch (err) {
    return false
  }
}

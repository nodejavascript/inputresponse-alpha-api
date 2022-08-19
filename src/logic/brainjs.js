import { UserInputError } from 'apollo-server-express'

// https://openbase.com/js/brain.js/documentation
import * as brain from 'brain.js'

import { NeuralNetwork, TrainingHistory, ModelSample, ModelPrediction } from '../models'

import {
  returnNeuralNetworkStore,
  newNeuralNetworkStore,
  updateNeuralNetworkStore,
  createDocument,
  updateDocument,
  findDocuments
} from './'

import { getTickCount, uniqArray } from '../lib'

const { INTERATIONS } = process.env

// spike to find brainjs trained status
const memoryNeuralNetworkIsTrained = net => {
  try {
    net.toJSON()
    return true
  } catch (err) {
    return false
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

export const createOrReturnMemoryNeuralNetwork = neuralnetworkId => {
  const existing = returnNeuralNetworkStore(neuralnetworkId)

  if (existing) return existing

  const net = new brain.NeuralNetwork()
  const createdAt = new Date()

  const memoryNeuralNetwork = {
    neuralnetworkId: neuralnetworkId.toString(),
    isTrained: false,
    net,
    createdAt,
    updatedAt: createdAt
  }

  return newNeuralNetworkStore(memoryNeuralNetwork)
}

// need mqtt version
export const trainMemoryNeuralNetwork = async (req, neuralnetworkId, info = { }) => {
  // console.log('need mqtt version of trainMemoryNeuralNetwork')

  const memoryNeuralNetwork = createOrReturnMemoryNeuralNetwork(neuralnetworkId)

  const modelsamples = await findDocuments(ModelSample, { neuralnetworkId, enabled: true })

  const modelSize = modelsamples.length
  if (modelSize === 0) throw new UserInputError('Model can not be trained without a sample.')

  const inputSize = modelsamples.reduce((total, currentValue) => {
    const { input } = currentValue
    const keyLength = Object.keys(input).length
    return keyLength > total ? keyLength : total
  }, 0)

  const outputSize = modelsamples.reduce((total, currentValue) => {
    const { output } = currentValue
    const keyLength = Object.keys(output).length
    return keyLength > total ? keyLength : total
  }, 0)

  const inputRange = inputSize
  const hiddenLayers = [4, 6, 5]

  memoryNeuralNetwork.net.options = { inputSize, outputSize, inputRange, hiddenLayers }

  // hiddenLayers: [4, 6, 5],
  // activation: 'sigmoid', // activation function

  const start = getTickCount()

  const model = modelsamples.map(({ input, output }) => ({ input, output }))
  const trainingResponse = await memoryNeuralNetwork.net.trainAsync(model, { iterations: parseInt(INTERATIONS) })

  const threshold = 0.001
  if (trainingResponse.error < threshold) throw new UserInputError(`Training error (${trainingResponse.error}) has gone below the threshold (${threshold}).`)

  const trainingMs = getTickCount() - start

  const samplesPerSecond = trainingMs ? modelSize / (trainingMs / 1000) : 0

  const update = {
    ...trainingResponse,
    net: memoryNeuralNetwork.net,
    samplesPerSecond,
    isTrained: true
  }

  updateNeuralNetworkStore(neuralnetworkId, update)

  const modelsampleIds = uniqArray(modelsamples.map(i => i.id))
  const samplingclientIds = uniqArray(modelsamples.map(i => i.samplingclientId))

  const { path: operation } = info

  const trainingHistory = {
    ...trainingResponse,
    neuralnetworkId,
    modelsampleIds,
    samplingclientIds,
    modelSize,
    inputSize,
    inputRange,
    outputSize,
    operation,
    trainingMs,
    samplesPerSecond
  }

  const { id: lastTraininghistoryId } = await createDocument(TrainingHistory, trainingHistory)

  return updateDocument(NeuralNetwork, neuralnetworkId, { lastTraininghistoryId })
}

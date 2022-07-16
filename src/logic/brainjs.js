import { UserInputError } from 'apollo-server-express'

// https://openbase.com/js/brain.js/documentation
import * as brain from 'brain.js'

import { NeuralNetwork, TrainingHistory, ModelSample, ModelPrediction } from '../models'

import {
  returnEnabedUserNeuralNetwork,
  returnMemoryNeuralNetwork,
  newMemoryNeuralNetwork,
  updateMemoryNeuralNetwork,
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
  const existing = returnMemoryNeuralNetwork(neuralnetworkId)
  if (existing) return existing

  const net = new brain.NeuralNetwork()
  const createdAt = new Date()

  const memoryNeuralNetwork = {
    neuralnetworkId: neuralnetworkId.toString(),
    net,
    createdAt
  }

  const created = newMemoryNeuralNetwork(memoryNeuralNetwork)

  console.log('created', created)

  return memoryNeuralNetwork
}

export const returnUserNeuralNeworkModel = async neuralnetworkId => {
  const modelsamples = await findDocuments(ModelSample, { neuralnetworkId, enabled: true })

  const model = modelsamples.map(({ input, output }) => ({ input, output }))
  const meta = modelsamples.map(({ id, samplingclientId }) => ({ id, samplingclientId }))

  return { model, meta }
}

// need mqtt version
export const trainMemoryNeuralNetwork = async (req, neuralnetworkId, info = { }) => {
  console.log('need mqtt version of trainMemoryNeuralNetwork')
  await returnEnabedUserNeuralNetwork(req, neuralnetworkId)

  const memoryNeuralNetwork = createOrReturnMemoryNeuralNetwork(neuralnetworkId)

  const { model, meta } = await returnUserNeuralNeworkModel(neuralnetworkId)

  const modelsampleIds = uniqArray(meta.map(i => i.id))
  const samplingclientIds = uniqArray(meta.map(i => i.samplingclientId))

  const modelSize = model.length
  if (model.length === 0) throw new UserInputError('Model can not be trained without a sample.')

  const firstSample = model[0]
  console.log('firstSample', firstSample)
  if (!firstSample.input || !firstSample.output) throw new UserInputError(`First sample missing params:${JSON.stringify(firstSample)}`)

  const inputSize = Object.keys(firstSample.input).length
  const inputRange = Object.keys(firstSample.input).length
  const outputSize = firstSample.output.length

  memoryNeuralNetwork.options = { inputSize, inputRange, outputSize }

  // hiddenLayers: [4, 6, 5],
  // activation: 'sigmoid', // activation function

  const start = getTickCount()

  const trainingResponse = await memoryNeuralNetwork.net.trainAsync(model, { iterations: parseInt(INTERATIONS) })

  const trainingMs = getTickCount() - start

  // console.log('net.toJSON()', memoryNeuralNetwork.net.toJSON())

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

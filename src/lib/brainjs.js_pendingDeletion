import * as brain from 'brain.js'

import { asyncReadDir, asyncWriteDir, asyncReadJSON, asyncWriteJSON, asyncDeleteJSON } from './'

const { DOCKER_VOLUME } = process.env
// hoisted
const userNeuralNetworks = [] // put in mongodb ?

console.log('\n\nBrain woke up...')

export const returnIntelligence = async (key, _input, preTrainingData) => {
  console.log('\n---- request intelligence -', (new Date()).toISOString())

  const input = returnCleanedJSON(_input)
  const model = await returnModel(key, preTrainingData)

  const { net, data } = await returnUserNeuralNetwork(key, model)

  const [diagram, likely, guess] = await Promise.all([
    brain.utilities.toSVG(net),
    brain.likely(input, net),
    net.run(input)
  ])

  const guessRounded = Math.round(guess)
  const guessFloat = Number.parseFloat(guess).toFixed(16)
  const guessPercent = (guessFloat * 100).toString()

  const confidenceLOW = guessRounded === 0 && ((0.5 - guessFloat) / 0.5) * 100
  const confidenceHIGH = guessRounded === 1 && ((guessFloat - 0.5) / 0.5) * 100

  const confidencePercent = Number.parseFloat(confidenceLOW || confidenceHIGH).toFixed(1)

  return {
    key,
    input,
    model,
    data,
    diagram,
    likely,
    guess,
    guessRounded,
    guessFloat,
    guessPercent,
    confidenceLOW,
    confidenceHIGH,
    confidencePercent
  }
}

export const resetModel = async key => {
  const index = userNeuralNetworks.findIndex(i => i.key === key)
  userNeuralNetworks.splice(index, 1)
  displayLog()
  console.log('\n\n\n\n\n')
  await asyncDeleteJSON({
    rootDirectory: DOCKER_VOLUME,
    jsonFilename: key
  })
  return { deleted: Boolean(index !== -1), deletedIndex: index, userNeuralNetworksLength: userNeuralNetworks.length }
}

export const saveNewDataToCache = async (key, input, output) => {
  const record = {
    input,
    output
  }
  const index = userNeuralNetworks.findIndex(i => i.key === key)
  userNeuralNetworks[index].data.push(record)
  displayLog()
  return { cached: Boolean(index !== -1), networkIndex: index, cachedLength: userNeuralNetworks[index].data.length }
}

export const saveNewDataToModel = async key => {
  const model = await returnSavedModel(key)
  const { data } = await returnUserNeuralNetwork(key)

  console.log('Appended', data.length, 'record(s)')

  const updatedModel = [...model, ...data]

  await Promise.all([
    saveModel(key, updatedModel),
    trainModel(key, updatedModel)
  ])
}

export const createDockerVolume = async () => {
  const root = await asyncReadDir({ filter: DOCKER_VOLUME })
  if (root.length === 0) {
    console.log('Filesystem was setup in the root', 'DOCKER_VOLUME:', DOCKER_VOLUME)
    await asyncWriteDir({
      directory: DOCKER_VOLUME
    })
  }
}

const returnUserNeuralNetwork = async (key, model) => {
  const userNeuralNetwork = userNeuralNetworks.find(i => i.key === key)
  if (userNeuralNetwork) return userNeuralNetwork

  if (!model) throw new Error('Model not found in memory.')
  if (!model[0]) throw new Error('Model has no records')

  const item = model[0]

  // https://github.com/BrainJS/brain.js#for-training-with-neuralnetwork
  const net = new brain.NeuralNetwork({
    // hiddenLayers: [4, 6, 5],
    // activation: 'sigmoid', // activation function

    inputSize: item.input.length,
    inputRange: item.input.length,
    outputSize: item.output.length
  })

  const data = []

  const neuralNetwork = { key, net, data }

  userNeuralNetworks.push(neuralNetwork)
  displayLog()

  // must save new model before training
  await saveModel(key, model)
  await trainModel(key, model)

  return neuralNetwork
}

const trainModel = async (key, model) => {
  const { net } = await returnUserNeuralNetwork(key, model)

  console.log('Training Model with', model.length, 'record(s)...')

  const start = getTickCount()

  const trainingTime = getTickCount() - start
  console.log('Training (ms):', trainingTime)

  const index = userNeuralNetworks.findIndex(i => i.key === key)
  userNeuralNetworks[index].net = net
}

const returnSavedModel = async key => {
  let model = []
  console.log('Model loading...')
  try {
    const start = getTickCount()
    model = await asyncReadJSON({
      rootDirectory: DOCKER_VOLUME,
      jsonFilename: key
    })
    const loadingTime = getTickCount() - start
    console.log('Loading (ms):', loadingTime)

    model = JSON.parse(model)
    console.log('Model loaded with', model.length, 'record(s)')
  } catch (err) {
    console.log('Model not found.')
  }
  return model
}

const returnModel = async (key, preTrainingData = []) => {
  let model = await returnSavedModel(key)
  if (model.length > 0) return model

  if (model.length === 0 && preTrainingData.length > 0) {
    model = [...model, ...preTrainingData]
    console.log(`Model { key: "${key}" } was just pre-trained with ${preTrainingData.length} record(s) because save was not found.`)
    return returnCleanedJSON(model)
  }

  throw new Error('Training data "preTrainingData" is required for first-run.')
}

const returnCleanedJSON = data => JSON.parse(JSON.stringify(data))

const saveModel = async (key, model) => {
  const index = userNeuralNetworks.findIndex(i => i.key === key)
  userNeuralNetworks[index].data = []

  console.log('Saving', model.length, 'record(s)...')

  const start = getTickCount()

  await asyncWriteJSON({
    rootDirectory: DOCKER_VOLUME,
    jsonFilename: key,
    data: model
  })
  const savingTime = getTickCount() - start

  console.log('Saving (ms):', savingTime)
}

// non blocking
const displayLog = () => {
  console.log('neuralNetworkCount', userNeuralNetworks.length)
  // if (neuralNetworkCount === 0) return

  // const lastUserNeuralNetwork = userNeuralNetworks[neuralNetworkCount - 1]
  // console.log('LOG: added to userNeuralNetworks > ', (new Date()).toISOString(), { key: lastUserNeuralNetwork.key, data: lastUserNeuralNetwork.data })
}

const getTickCount = () => (new Date()).getTime()

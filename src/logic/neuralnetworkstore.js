
const memoryNeuralNetworks = []

/*
  predictions should be immediate if not sooner

  IE
  Neural Network predicted 0 ms
  Neural Network predicted 0 ms
  Neural Network predicted 0 ms
  Neural Network predicted 1 ms

  requirements: fast and the `trained model` must always be ready to predict.

  need to spike on databases purposed for storing real-time AI

  Objective: Support real-time prediction requests
*/

export const returnMemoryNeuralNetworks = (neuralnetworkIds) => {
  if (!neuralnetworkIds) return memoryNeuralNetworks
  return memoryNeuralNetworks.filter(i => neuralnetworkIds.toString().includes(i.neuralnetworkId.toString()))
}

export const returnMemoryNeuralNetwork = neuralnetworkId => {
  return memoryNeuralNetworks.find(i => i.neuralnetworkId === neuralnetworkId.toString())
}

export const newMemoryNeuralNetwork = memoryNeuralNetwork => {
  memoryNeuralNetworks.push(memoryNeuralNetwork)
  const { neuralnetworkId } = memoryNeuralNetwork
  return returnMemoryNeuralNetwork(neuralnetworkId)
}

export const updateMemoryNeuralNetwork = (neuralnetworkId, net, options = { }) => {
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

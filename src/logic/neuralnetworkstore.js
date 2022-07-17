
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

export const returnNeuralNetworksStore = (neuralnetworkIds) => {
  if (!neuralnetworkIds) return memoryNeuralNetworks
  return memoryNeuralNetworks.filter(i => neuralnetworkIds.toString().includes(i.neuralnetworkId.toString()))
}

export const returnNeuralNetworkStore = neuralnetworkId => {
  return memoryNeuralNetworks.find(i => i.neuralnetworkId === neuralnetworkId.toString())
}

export const newNeuralNetworkStore = memoryNeuralNetwork => {
  memoryNeuralNetworks.push(memoryNeuralNetwork)
  const { neuralnetworkId } = memoryNeuralNetwork
  return returnNeuralNetworkStore(neuralnetworkId)
}

export const updateNeuralNetworkStore = (neuralnetworkId, update = { }) => {
  const index = memoryNeuralNetworks.findIndex(i => i.neuralnetworkId === neuralnetworkId.toString())

  const existing = memoryNeuralNetworks[index]

  const updatedAt = new Date()

  memoryNeuralNetworks[index] = {
    ...existing,
    ...update,
    updatedAt
  }

  return memoryNeuralNetworks[index]
}

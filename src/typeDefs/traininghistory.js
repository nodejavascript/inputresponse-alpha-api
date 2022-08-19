import { gql } from 'apollo-server-express'
import { commonToCoreQueries } from './common'

export default gql`
  type TrainingHistory {
    ${commonToCoreQueries}

    neuralnetworkId: String
    modelsampleIds: [String]
    modelSamples: [ModelSample]
    samplingclientIds: [String]
    samplingClients: [SamplingClient]

    modelSize: Int
    inputSize: Int
    inputRange: Int
    outputSize: Int

    trainingMs: Int
    samplesPerSecond: Float
    error: Float
    iterations: Int

    neuralNetwork: NeuralNetwork
    operation: Operation
  }

  type Operation {
    key: String
    typename: String
  }
`

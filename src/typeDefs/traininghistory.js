import { gql } from 'apollo-server-express'
import { commonToCoreQueries } from './common'

export default gql`
  type TrainingHistory {
    ${commonToCoreQueries}

    neuralnetworkId: String
    modelsampleIds: [String]
    samplingclientId: [String]

    modelSize: Int
    inputSize: Int
    inputRange: Int
    outputSize: Int

    trainingMs: Int
    samplesPerSecond: Float

    neuralNetwork: NeuralNetwork
  }
`

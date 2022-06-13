import { gql } from 'apollo-server-express'
import { commonToCoreQueries } from './common'

export default gql`
  type TrainingHistory {
    ${commonToCoreQueries}

    neuralnetworkId: String
    modelSize: Int
    trainingMs: Int
    samplesPerSecond: Float

    neuralNetwork: NeuralNetwork
  }
`

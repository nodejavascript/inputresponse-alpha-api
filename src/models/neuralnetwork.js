import { Schema } from 'mongoose'
import { ModelSample } from './'
import { connectDatabase, fromNow, toUnix } from '../lib'
import { returnApiKeyExpired } from '../resolvers/neuralnetwork'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'
import { trainingHistorySchema } from './traininghistory'

const commonName = 'NeuralNetwork'

const { ObjectId } = Schema.Types

const neuralNetworkSchema = new Schema(
  {
    ...commonToCoreSchemas,
    userId: {
      type: ObjectId,
      ref: 'User',
      sparse: true
    },
    apiKey: {
      type: String,
      sparse: true
    },
    apiKeyCreated: {
      type: Date
    },
    apiKeyExpires: {
      type: Date
    },
    lastTrainingHistory: trainingHistorySchema
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

createVirtuals(neuralNetworkSchema, commonName)
createStatics(neuralNetworkSchema, commonName)

// non blocking
neuralNetworkSchema.virtual('apiKeyExpired').get(function () {
  return returnApiKeyExpired(this)
})

neuralNetworkSchema.virtual('apiKeyCreatedAgo').get(function () {
  return fromNow(this.apiKeyCreated)
})

neuralNetworkSchema.virtual('apiKeyCreatedUnix').get(function () {
  return toUnix(this.apiKeyCreated)
})

neuralNetworkSchema.virtual('apiKeyExpiresAgo').get(function () {
  return fromNow(this.apiKeyExpires)
})

neuralNetworkSchema.virtual('apiKeyExpiresUnix').get(function () {
  return toUnix(this.apiKeyExpires)
})

// blocking
neuralNetworkSchema.virtual('modelSize').get(function () {
  const { _id: neuralnetworkId } = this
  return ModelSample.returnCount({ neuralnetworkId })
})

const NeuralNetwork = connectDatabase().model(commonName, neuralNetworkSchema, 'neuralnetwork')

export default NeuralNetwork

import { Schema } from 'mongoose'
import { ModelSample } from './'
import { connectDatabase, fromNow, toUnix } from '../lib'
import { returnApiKeyExpired } from '../resolvers/neuralnetwork'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

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
    lastTraininghistoryId: {
      type: ObjectId,
      ref: 'TrainingHistory'
    }
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
  return this.apiKeyCreated ? fromNow(this.apiKeyCreated) : 'never'
})

neuralNetworkSchema.virtual('apiKeyCreatedUnix').get(function () {
  return this.apiKeyCreated ? toUnix(this.apiKeyCreated) : 'never'
})

neuralNetworkSchema.virtual('apiKeyExpiresAgo').get(function () {
  return this.apiKeyExpires ? fromNow(this.apiKeyExpires) : 'never'
})

neuralNetworkSchema.virtual('apiKeyExpiresUnix').get(function () {
  return this.apiKeyExpires ? toUnix(this.apiKeyExpires) : 'never'
})

// blocking
neuralNetworkSchema.virtual('modelSize').get(async function () {
  const { _id: neuralnetworkId } = this
  return ModelSample.returnCount({ neuralnetworkId, enabled: true })
})

const NeuralNetwork = connectDatabase().model(commonName, neuralNetworkSchema, 'neuralnetwork')

export default NeuralNetwork

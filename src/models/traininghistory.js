import { Schema } from 'mongoose'
import { connectDatabase } from '../lib'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

const commonName = 'TrainingHistory'

const { ObjectId } = Schema.Types

export const trainingHistorySchema = new Schema(
  {
    ...commonToCoreSchemas,
    neuralnetworkId: {
      type: ObjectId,
      ref: 'NeuralNetwork',
      sparse: true
    },
    modelsampleIds: [{
      type: ObjectId,
      ref: 'ModelSample'
    }],
    samplingclientIds: [{
      type: ObjectId,
      ref: 'SamplingClient'
    }],
    modelSize: {
      type: Number
    },
    inputSize: {
      type: Number
    },
    inputRange: {
      type: Number
    },
    outputSize: {
      type: Number
    },
    trainingMs: {
      type: Number
    },
    samplesPerSecond: {
      type: Number
    },
    error: {
      type: Number
    },
    iterations: {
      type: Number
    },
    operation: {
      key: {
        type: String
      },
      typename: {
        type: String
      }
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

createVirtuals(trainingHistorySchema, commonName)
createStatics(trainingHistorySchema, commonName)

const TrainingHistory = connectDatabase().model(commonName, trainingHistorySchema, 'traininghistory')

export default TrainingHistory

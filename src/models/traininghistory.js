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
    modelSize: {
      type: Number
    },
    trainingMs: {
      type: Number
    },
    samplesPerSecond: {
      type: Number
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

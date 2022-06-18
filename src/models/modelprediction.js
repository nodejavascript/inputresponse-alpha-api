import { Schema } from 'mongoose'
import { connectDatabase } from '../lib'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

const commonName = 'ModelPrediction'

const { ObjectId } = Schema.Types

const modelPredictionSchema = new Schema(
  {
    ...commonToCoreSchemas,
    userId: {
      type: ObjectId,
      ref: 'User',
      sparse: true
    },
    neuralnetworkId: {
      type: ObjectId,
      ref: 'NeuralNetwork',
      sparse: true
    },
    samplingclientId: {
      type: ObjectId,
      ref: 'SamplingClient',
      sparse: true
    },
    traininghistoryId: {
      type: ObjectId,
      ref: 'TrainingHistory'
    },
    input: {},
    diagram: {
      type: String
    },
    likely: {},
    guess: {},
    toJSON: {},
    predictionMs: {
      type: Number
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

modelPredictionSchema.index({ neuralnetworkId: 1 })

createVirtuals(modelPredictionSchema, commonName)
createStatics(modelPredictionSchema, commonName)

modelPredictionSchema.virtual('inputDisplay').get(function () {
  return JSON.stringify(this.input)
})

modelPredictionSchema.virtual('outputDisplay').get(function () {
  return JSON.stringify(this.output)
})

const ModelPrediction = connectDatabase().model(commonName, modelPredictionSchema, 'modelprediction')

export default ModelPrediction

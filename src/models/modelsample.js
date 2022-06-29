import { Schema } from 'mongoose'
import { connectDatabase } from '../lib'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

const commonName = 'ModelSample'

const { ObjectId } = Schema.Types

const modelSampleSchema = new Schema(
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
    input: {},
    output: {},
    skipTraining: {
      type: Boolean
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

modelSampleSchema.index({ neuralnetworkId: 1 })

createVirtuals(modelSampleSchema, commonName)
createStatics(modelSampleSchema, commonName)

modelSampleSchema.virtual('inputDisplay').get(function () {
  return JSON.stringify(this.input)
})

modelSampleSchema.virtual('outputDisplay').get(function () {
  return JSON.stringify(this.output)
})

const ModelSample = connectDatabase().model(commonName, modelSampleSchema, 'modelsample')

export default ModelSample

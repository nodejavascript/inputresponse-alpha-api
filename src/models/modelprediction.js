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

modelPredictionSchema.virtual('guesses').get(function () {
  if (!this.guess) return []

  const guesses = []

  Object.keys(this.guess).forEach(key => {
    const confidence = Math.abs(this.guess[key] - 0.5) / 0.5
    console.log('confidence', confidence)
    guesses.push({
      key,
      confidence: this.guess[key]
    })
  })

  return guesses
})

modelPredictionSchema.virtual('guessFloat').get(function () {
  return this.guess['0'] >= 0 && this.guess['0']
})

modelPredictionSchema.virtual('guessRounded').get(function () {
  const guessRounded = Math.round(this.guess['0'])
  return guessRounded >= 0 && guessRounded
})

const ModelPrediction = connectDatabase().model(commonName, modelPredictionSchema, 'modelprediction')

export default ModelPrediction

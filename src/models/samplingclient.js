import { Schema } from 'mongoose'
import { ModelSample } from './'
import { connectDatabase } from '../lib'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

const commonName = 'SamplingClient'

const { ObjectId } = Schema.Types

const samplingClientSchema = new Schema(
  {
    ...commonToCoreSchemas,
    userId: {
      type: ObjectId,
      ref: 'User',
      sparse: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

createVirtuals(samplingClientSchema, commonName)
createStatics(samplingClientSchema, commonName)

// blocking
samplingClientSchema.virtual('modelSize').get(async function () {
  const { _id: samplingclientId } = this
  return ModelSample.returnCount({ samplingclientId, enabled: true })
})

const SamplingClient = connectDatabase().model(commonName, samplingClientSchema, 'samplingclient')

export default SamplingClient

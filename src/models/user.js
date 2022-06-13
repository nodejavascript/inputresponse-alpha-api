import { Schema } from 'mongoose'
import { NeuralNetwork, SamplingClient, ModelSample } from './'
import { connectDatabase } from '../lib'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

const commonName = 'User'

const userSchema = new Schema(
  {
    ...commonToCoreSchemas,
    googleUserId: {
      type: String,
      trim: true,
      unique: true
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

createVirtuals(userSchema, commonName)
createStatics(userSchema, commonName)

// blocking
userSchema.virtual('neuralNetworkSize').get(async function () {
  const { _id: userId } = this
  return NeuralNetwork.returnCount({ userId })
})

// blocking
userSchema.virtual('samplingClientSize').get(async function () {
  const { _id: userId } = this
  return SamplingClient.returnCount({ userId })
})

// blocking
userSchema.virtual('userModelSize').get(async function () {
  const { _id: userId } = this

  const neuralnetworks = await NeuralNetwork.where({ userId })

  if (neuralnetworks.length === 0) return 0

  const query = {
    neuralnetworkId: {
      $in: neuralnetworks.map(i => i._id)
    }
  }
  return ModelSample.returnCount(query)
})

const User = connectDatabase().model(commonName, userSchema, 'user')

export default User

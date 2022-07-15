import { Schema } from 'mongoose'
import { connectDatabase } from '../lib'
import { createVirtuals, createStatics, commonToCoreSchemas } from './common'

const commonName = 'Mqtt'

const mqttSchema = new Schema(
  {
    ...commonToCoreSchemas,
    topic: {
      type: String,
      sparse: true
    },
    payload: {}
  },
  {
    timestamps: true,
    toObject: { virtuals: true }
  }
)

createVirtuals(mqttSchema, commonName)
createStatics(mqttSchema, commonName)

mqttSchema.virtual('inputDisplay').get(function () {
  return JSON.stringify(this.input)
})

mqttSchema.virtual('outputDisplay').get(function () {
  return JSON.stringify(this.output)
})

const Mqtt = connectDatabase().model(commonName, mqttSchema, 'mqtt')

export default Mqtt

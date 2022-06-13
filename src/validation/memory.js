import Joi from 'joi'
import { id } from './common'

const neuralnetworkId = id.label('neuralnetworkId')

export const validateTrainNeuralNetworkInput = Joi.object().keys({
  neuralnetworkId
})

import Joi from 'joi'
import { commonToCore, id } from './common'

const userId = id.label('userId')
const neuralnetworkId = id.label('neuralnetworkId')
const apiKeyExpires = Joi.date().allow(null).allow('').label('apiKeyExpires').messages()

export const validateInsertNeuralNetworkInput = Joi.object().keys({
  ...commonToCore,
  userId
})

export const validateUpdateNeuralNetworkInput = Joi.object().keys({
  ...commonToCore,
  neuralnetworkId
})

export const validateRequestNewApiKeyInput = Joi.object().keys({
  neuralnetworkId,
  apiKeyExpires
})

export const validateNeuralNetworkModelInput = Joi.object().keys({
  neuralnetworkId
})

export const validateQueryNeuralNetworkInput = Joi.object().keys({
  neuralnetworkId
})

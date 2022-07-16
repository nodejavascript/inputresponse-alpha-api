import Joi from 'joi'
import { commonToCore, id } from './common'

const userId = id.label('userId')
const neuralnetworkId = id.label('neuralnetworkId')
const apiKeyExpires = Joi.date().allow(null).allow('').label('apiKeyExpires').messages()
const resetApiKey = Joi.boolean().allow(null).label('resetApiKey').messages()
const deleteExpiry = Joi.boolean().allow(null).label('deleteExpiry').messages()

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
  apiKeyExpires,
  resetApiKey,
  deleteExpiry
})

export const validateNeuralNetworkModelInput = Joi.object().keys({
  neuralnetworkId
})

export const validateQueryNeuralNetworkInput = Joi.object().keys({
  neuralnetworkId
})

export const validateDisableModelSamplesInput = Joi.object().keys({
  neuralnetworkId
})

export const validateTrainNeuralNetworkInput = Joi.object().keys({
  neuralnetworkId
})

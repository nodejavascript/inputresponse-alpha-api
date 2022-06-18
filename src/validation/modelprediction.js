import Joi from 'joi'
import { commonToCore, id } from './common'

const apiKey = Joi.string().required().min(32).max(32).label('apiKey').messages()
const samplingclientId = id.label('samplingclientId')
const modelpredictionId = id.label('modelpredictionId')
const input = Joi.object().required().min(1).label('input').messages()

// const item = Joi.string().alphanum().min(1).label('item').messages()
// output.items(item)

export const validateInsertModelPredictionInput = Joi.object().keys({
  ...commonToCore,
  apiKey,
  samplingclientId,
  input
})

export const validateUpdateModelPredictionInput = Joi.object().keys({
  ...commonToCore,
  modelpredictionId,
  input
})

export const validateQueryModelPredictionInput = Joi.object().keys({
  modelpredictionId
})

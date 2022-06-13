import Joi from 'joi'
import { commonToCore, id } from './common'

const apiKey = Joi.string().required().min(32).max(32).label('apiKey').messages()
const samplingclientId = id.label('samplingclientId')
const modelsampleId = id.label('modelsampleId')
const input = Joi.object().required().min(1).label('input').messages()

// const item = Joi.string().alphanum().min(1).label('item').messages()
// output.items(item)
const output = Joi.array().required().min(1).label('output array').messages()

export const validateInsertModelSampleInput = Joi.object().keys({
  ...commonToCore,
  apiKey,
  samplingclientId,
  input,
  output
})

export const validateUpdateModelSampleInput = Joi.object().keys({
  ...commonToCore,
  modelsampleId,
  input,
  output
})

export const validateQueryModelSampleInput = Joi.object().keys({
  modelsampleId
})

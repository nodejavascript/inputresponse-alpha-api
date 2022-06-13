import Joi from 'joi'
import { commonToCore, id } from './common'

const userId = id.label('userId')
const samplingclientId = id.label('samplingclientId')

export const validateInsertSamplingClientInput = Joi.object().keys({
  ...commonToCore,
  userId
})

export const validateUpdateSamplingClientInput = Joi.object().keys({
  ...commonToCore,
  samplingclientId
})

export const validateQuerySamplingClientInput = Joi.object().keys({
  samplingclientId
})

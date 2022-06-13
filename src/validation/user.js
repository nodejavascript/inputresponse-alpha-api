import Joi from 'joi'
import { commonToCore, id } from './common'

const userId = id.label('userId')
const googleUserId = Joi.string().required().label('googleUserId').messages()

export const validateGoogleUser = Joi.object().keys({
  ...commonToCore,
  googleUserId
})

export const validateQueryUserInput = Joi.object().keys({
  userId
})

export const validateUpdateProfileInput = Joi.object().keys({
  ...commonToCore
})

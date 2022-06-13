import Joi from 'joi'

const key = Joi.string().alphanum().min(3).max(50).required().label('key').messages()
const input = Joi.object().required().label('input').messages()
const preTrainingData = Joi.array().required().label('preTrainingData').messages()
const output = Joi.array().required().label('output').messages()

export const validateReturnIntelligenceInput = Joi.object().keys({
  key,
  input,
  preTrainingData
})

export const validateResetModelInput = Joi.object().keys({
  key
})

export const validateSaveNewDataToCacheInput = Joi.object().keys({
  key,
  input,
  output
})

export const validateSaveNewDataToModelInput = Joi.object().keys({
  key
})

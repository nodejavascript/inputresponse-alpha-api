import Joi from 'joi'

export const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i).messages({
  'string.pattern.base': 'Invalid id pattern'
})
export const id = objectId.required().messages()
export const optionalId = objectId.allow(null).messages()

const order = Joi.number().allow('').allow(null).label('order').messages()
const name = Joi.string().allow('').allow(null).label('name').messages()
const note = Joi.string().allow('').allow(null).label('note').messages()
const imageURL = Joi.string().allow('').allow(null).label('imageURL').messages()
const archived = Joi.boolean().allow(null).label('archived').messages()
const enabled = Joi.boolean().allow(null).label('enabled').messages()

export const commonToCore = {
  order,
  name,
  note,
  imageURL,
  enabled,
  archived
}

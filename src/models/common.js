import { UserInputError } from 'apollo-server-express'
import { fromNow, toUnix } from '../lib'

// please put all blocking (promise) virtuals in model file
export const createVirtuals = (schema, commonName) => {
  schema.virtual('key').get(function () {
    return `${commonName.toLowerCase()}_${this._id}`
  })

  schema.virtual('createdAtAgo').get(function () {
    return fromNow(this.createdAt)
  })

  schema.virtual('updatedAtAgo').get(function () {
    return fromNow(this.updatedAt)
  })

  schema.virtual('createdAtUnix').get(function () {
    return toUnix(this.createdAt)
  })

  schema.virtual('updatedAtUnix').get(function () {
    return toUnix(this.updatedAt)
  })

  return schema
}

export const createStatics = (schema, commonName) => {
  schema.statics.ensureNotExists = async function (options) {
    const ensureNotExists = await this.where(options).countDocuments() > 0
    if (ensureNotExists) throw new UserInputError(`${commonName} already exists`)
  }

  schema.statics.ensureValid = async function (options) {
    const notValid = await this.where({ ...options }).countDocuments() === 0
    if (notValid) throw new UserInputError(`${commonName} is not valid`)
  }

  schema.statics.doesExist = async function (options) {
    const doesExist = await this.where(options).countDocuments() > 0
    return !!doesExist
  }

  schema.statics.returnCount = async function (options) {
    return this.where(options).countDocuments() || 0
  }

  return schema
}

export const commonToCoreSchemas = {
  order: {
    type: Number
  },
  name: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  imageURL: {
    type: String,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  archived: {
    type: Boolean,
    default: false
  }
}

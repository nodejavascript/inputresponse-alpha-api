import { validateReturnIntelligenceInput, validateResetModelInput, validateSaveNewDataToCacheInput, validateSaveNewDataToModelInput } from '../validation'
import { returnIntelligence, resetModel, saveNewDataToCache, saveNewDataToModel } from '../lib'

export default {
  Mutation: {
    returnIntelligence: async (root, args, { req, res }, info) => {
      const { returnIntelligenceInput } = args

      await validateReturnIntelligenceInput.validateAsync(returnIntelligenceInput, { abortEarly: false })

      const { key, input, preTrainingData } = returnIntelligenceInput
      return returnIntelligence(key, input, preTrainingData)
    },
    resetModel: async (root, args, { req, res }, info) => {
      const { resetModelInput } = args

      await validateResetModelInput.validateAsync(resetModelInput, { abortEarly: false })

      const { key } = resetModelInput
      return resetModel(key)
    },
    saveNewDataToCache: async (root, args, { req, res }, info) => {
      const { saveNewDataToCacheInput } = args

      await validateSaveNewDataToCacheInput.validateAsync(saveNewDataToCacheInput, { abortEarly: false })

      const { key, input, output } = saveNewDataToCacheInput
      return saveNewDataToCache(key, input, output)
    },
    saveNewDataToModel: async (root, args, { req, res }, info) => {
      const { saveNewDataToModelInput } = args

      await validateSaveNewDataToModelInput.validateAsync(saveNewDataToModelInput, { abortEarly: false })

      const { key } = saveNewDataToModelInput
      await saveNewDataToModel(key)

      return true
    }
  }
}

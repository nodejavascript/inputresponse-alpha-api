import { User, NeuralNetwork, SamplingClient, ModelSample } from '../models'
import { validateQueryUserInput, validateUpdateProfileInput } from '../validation'
import { returnTrustedUser, findDocuments, findDocument, updateDocument } from '../logic'

export default {
  Query: {
    users: async (root, args, { req, res }, info) => findDocuments(User),
    user: async (root, args, { req, res }, info) => {
      const { queryUserInput } = args

      await validateQueryUserInput.validateAsync(queryUserInput, { abortEarly: false })

      const { userId: _id } = queryUserInput
      const query = { _id }

      const [user] = await Promise.all([
        findDocument(User, query),
        User.ensureValid(query)
      ])

      return user
    },
    me: async (root, args, { req, res }, info) => returnTrustedUser(req),
    profile: async (root, args, { req, res }, info) => {
      const user = await returnTrustedUser(req)

      return user
    }
  },
  Mutation: {
    updateProfile: async (root, args, { req, res }, info) => {
      const { updateProfileInput } = args

      await validateUpdateProfileInput.validateAsync(updateProfileInput, { abortEarly: false })

      const { _id } = await returnTrustedUser(req)

      return updateDocument(User, _id, updateProfileInput)
    }
  },
  User: {
    neuralNetworks: async (user, args, { req, res }, info) => {
      const { id: userId } = user
      return findDocuments(NeuralNetwork, { userId })
    },
    samplingClients: async (user, args, { req, res }, info) => {
      const { id: userId } = user
      return findDocuments(SamplingClient, { userId })
    },
    modelSamples: async (user, args, { req, res }, info) => {
      const { id: userId } = await returnTrustedUser(req)
      return findDocuments(ModelSample, { userId })
    }
  }
}

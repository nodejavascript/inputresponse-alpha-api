import { Mqtt } from '../models'
import { findDocuments } from '../logic'

export default {
  Query: {
    mqtts: async (root, args, { req, res }, info) => {
      return findDocuments(Mqtt)
    }
  }
}

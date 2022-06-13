import { returnAbout } from '../lib'

export default {
  Query: {
    about: (root, args, { req, res }, info) => returnAbout(req),
    healthCheck: async () => true
  }
}

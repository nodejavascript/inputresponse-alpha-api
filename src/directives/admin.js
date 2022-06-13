import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

import { returnTrustedUser } from '../logic'

const { ADMIN_GOOGLEID } = process.env

export default class AdminDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , { req }] = args

      if (!ADMIN_GOOGLEID) throw new AuthenticationError('Access denied')

      const { googleUserId } = await returnTrustedUser(req)
      if (ADMIN_GOOGLEID !== googleUserId) throw new AuthenticationError('Access denied')

      return resolve.apply(this, args)
    }
  }
}

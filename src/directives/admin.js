import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

import { returnTrustedUser } from '../logic'

export default class AdminDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , { req }] = args

      const { admin } = await returnTrustedUser(req)

      if (admin) return resolve.apply(this, args)

      throw new AuthenticationError('Access denied')
    }
  }
}

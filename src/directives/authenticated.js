import { SchemaDirectiveVisitor } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

import { returnTrustedUser } from '../logic'

export default class AuthenticatedDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , { req }] = args

      await returnTrustedUser(req)

      return resolve.apply(this, args)
    }
  }
}

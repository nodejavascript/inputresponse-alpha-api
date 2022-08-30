import { SchemaDirectiveVisitor } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

import { returnTrustedSamplingClient } from '../logic'

export default class ApikeyDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , { req }] = args

      await returnTrustedSamplingClient(req)

      return resolve.apply(this, args)
    }
  }
}

// https://www.apollographql.com/docs/graphql-tools/schema-directives/
// to use create a QUERY selecting a date field like this:
// start(format: "yyyy-mm-dd")
import { SchemaDirectiveVisitor } from 'apollo-server-express'
import { defaultFieldResolver, GraphQLString } from 'graphql'
import { dayjsDefaultFormat } from '../lib'

export default class FormattableDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const { resolve = defaultFieldResolver } = field

    field.args.push({
      name: 'format',
      type: GraphQLString
    })

    field.resolve = async (source, { format, ...otherArgs }, context, info) => {
      const date = await resolve.call(this, source, otherArgs, context, info)

      if (date) return dayjsDefaultFormat(date)

      return null
    }

    field.type = GraphQLString
  }
}

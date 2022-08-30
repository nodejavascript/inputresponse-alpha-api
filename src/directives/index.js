// don't forget sync ../typeDefs/root.js

import AdminDirective from './admin'
import AuthenticatedDirective from './authenticated'
import ApikeyDirective from './apikey'
import FormattableDateDirective from './date'

export default {
  admin: AdminDirective,
  authenticated: AuthenticatedDirective,
  apikey: ApikeyDirective,
  date: FormattableDateDirective
}

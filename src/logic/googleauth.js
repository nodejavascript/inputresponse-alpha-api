import { AuthenticationError } from 'apollo-server-express'

import { OAuth2Client } from 'google-auth-library'

const { CLIENT_APP_GOOGLE_CLIENTID } = process.env

const client = new OAuth2Client(CLIENT_APP_GOOGLE_CLIENTID)
const audience = CLIENT_APP_GOOGLE_CLIENTID

export const verifyGoogleToken = async idToken => {
  try {
    const ticket = await client.verifyIdToken({ idToken, audience })

    const { sub: googleUserId } = ticket.getPayload()

    return { googleUserId }
  } catch (err) {
    const message = err.toString().split(',')[0]
    console.log('verifyGoogleToken', message)
    throw new AuthenticationError('LOGOUT')
  }
}

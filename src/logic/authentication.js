// https://developers.google.com/identity/sign-in/web/backend-auth
import { AuthenticationError } from 'apollo-server-express'
import { User } from '../models'
import { validateGoogleUser } from '../validation'

import { redisKey, redisSet, redisGet } from '../lib'
import { verifyGoogleToken, createDocument, findDocument, updateDocument } from './'

const { NODE_ENV, ADMIN_GOOGLEID, REDIS_CACHE_PREFIX_GOOGLE_USER, REDIS_CACHE_EXPIRES_SECONDS_GOOGLE_USER } = process.env

const returnName = idToken => redisKey(idToken, REDIS_CACHE_PREFIX_GOOGLE_USER)

// ZERO-TRUST! ZERO-TRUST! ZERO-TRUST!
export const returnTrustedUser = async req => {
  const [idToken, admin] = await Promise.all([
    returnAuthTokenFromHeader(req),
    (ADMIN_GOOGLEID && NODE_ENV === 'local') && await returnUser({
      googleUserId: ADMIN_GOOGLEID
    })
  ])

  const adminUser = admin && { userId: admin.id }

  const cachedUser = await returnCachedUser(idToken)

  const authenticatedUser = adminUser || cachedUser

  const foundUser = await returnUser(authenticatedUser)

  let userId

  if (foundUser) {
    userId = foundUser.id
  } else {
    // can happen if cache exists and user does not exist because delete
    const googleUser = await verifyGoogleToken(idToken)
    const refreshedUser = await returnUser(googleUser)
    userId = refreshedUser.id
  }

  const [user] = await Promise.all([
    updateDocument(User, userId, authenticatedUser),
    cacheUser(idToken, { ...authenticatedUser, userId })
  ])

  return user
}

const returnUser = async authenticatedUser => {
  const { userId } = authenticatedUser

  // find by expected userId in cache
  const user = userId && findDocument(User, { _id: userId })
  if (user) return user

  await validateGoogleUser.validateAsync(authenticatedUser, { abortEarly: false })

  const { googleUserId } = authenticatedUser
  const foundUser = await findDocument(User, { googleUserId })
  if (foundUser) return foundUser

  return createDocument(User, authenticatedUser)
}

const returnAuthTokenFromHeader = async req => {
  const authorization = req.headers.authorization
  if (!authorization) throw new AuthenticationError('Authorization is required')

  const [bearer, idToken] = authorization.split(' ')
  if (bearer !== 'Bearer') throw new AuthenticationError('Bearer is required')
  if (!idToken) throw new AuthenticationError('Authorization token is required')

  return idToken
}

const returnCachedUser = async idToken => {
  const cache = await redisGet(returnName(idToken))
  return cache && JSON.parse(cache)
}

const cacheUser = async (idToken, user) => redisSet(returnName(idToken), JSON.stringify(user), REDIS_CACHE_EXPIRES_SECONDS_GOOGLE_USER)

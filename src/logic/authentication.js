// https://developers.google.com/identity/sign-in/web/backend-auth
import { AuthenticationError } from 'apollo-server-express'
import { User } from '../models'
import { validateGoogleUser } from '../validation'

import { redisKey, redisSet, redisGet } from '../lib'
import { verifyGoogleToken, createDocument, findDocument, updateDocument } from './'

const { REDIS_CACHE_PREFIX_GOOGLE_USER, REDIS_CACHE_EXPIRES_SECONDS_GOOGLE_USER } = process.env

const returnName = idToken => redisKey(idToken, REDIS_CACHE_PREFIX_GOOGLE_USER)

const debug = false

// ZERO-TRUST! ZERO-TRUST! ZERO-TRUST!

export const returnBearer = req => {
  !req.headers && new AuthenticationError('Headers are required')
  !req.headers.authorization && new AuthenticationError('Authorization are required')

  const { authorization, samplingclientid } = req.headers
  const [bearer, token] = authorization.split(' ')
  if (bearer !== 'Bearer') throw new AuthenticationError('Bearer is required')
  if (!token) throw new AuthenticationError('Authorization not in header')

  return { token, samplingclientid }
}

export const returnTrustedUser = async req => {
  // this is built to favour zero-trust
  const { token } = await returnBearer(req)

  if (debug) throw new Error('stop')

  const cachedUser = await returnCachedUser(token)

  const foundUser = cachedUser && await returnUser(cachedUser)

  let userId

  if (foundUser) {
    userId = foundUser.id
  } else {
    // can happen if cache exists and user does not exist because delete
    const googleUser = await verifyGoogleToken(token)
    const refreshedUser = await returnUser(googleUser)
    userId = refreshedUser.id
  }

  const [user] = await Promise.all([
    updateDocument(User, userId, foundUser),
    cacheUser(token, { ...foundUser, userId })
  ])

  // const { enabled } = user
  // if (!enabled) throw new AuthenticationError('Authorization is denied.')

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

const returnCachedUser = async idToken => {
  const cache = await redisGet(returnName(idToken))
  return cache && JSON.parse(cache)
}

const cacheUser = async (idToken, user) => redisSet(returnName(idToken), JSON.stringify(user), REDIS_CACHE_EXPIRES_SECONDS_GOOGLE_USER)

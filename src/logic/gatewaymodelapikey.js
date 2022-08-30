import { AuthenticationError } from 'apollo-server-express'
import { NeuralNetwork, SamplingClient } from '../models'
import { expiresSeconds, redisKey, redisSet, redisGet, redisDelete, redisKeys } from '../lib'
import { returnTrustedUser, findDocument, returnBearer } from './'

const { REDIS_CACHE_PREFIX_USERNN, REDIS_CACHE_PREFIX_APIKEY, REDIS_CACHE_PREFIX_SAMPLING_CLIENT, REDIS_CACHE_EXPIRES_SECONDS_SAMPLING_CLIENT } = process.env

const keysToClear = ['APIKEY']

export const returnTrustedSamplingClient = async req => {
  const { token: apiKey, samplingclientid } = returnBearer(req)
  if (!samplingclientid) throw new AuthenticationError('samplingclientid not in header')

  const cacheValue = `${apiKey}_${samplingclientid}`

  const cachedApikey = await returnCachedApikey(cacheValue)

  if (cachedApikey) return cachedApikey

  const enabled = true
  const [neuralnetwork, samplingclient] = await Promise.all([
    findDocument(NeuralNetwork, { enabled, apiKey }),
    findDocument(SamplingClient, { enabled, _id: samplingclientid })
  ])

  if (!neuralnetwork) throw new AuthenticationError('apiKey is invalid')
  if (!samplingclient) throw new AuthenticationError('samplingClientId key is invalid')
  if (neuralnetwork.userId.toString() !== samplingclient.userId.toString()) throw new AuthenticationError('Credentials are invalid')

  const { apiKeyExpired, apiKeyExpires } = neuralnetwork
  if (await apiKeyExpired) throw new AuthenticationError('apiKey is expired')

  const neuralnetworkId = neuralnetwork.id
  const userId = neuralnetwork.userId

  const expiresInSeconds = apiKeyExpires && expiresSeconds(apiKeyExpires)
  setCacheApikey(cacheValue, { neuralnetworkId, samplingclientid, userId }, expiresInSeconds)
  return { neuralnetworkId, samplingclientid }
}

export const clearRedisKeys = async () => {
  await Promise.all(
    keysToClear.map(async prefix => {
      const keys = await redisKeys(prefix)
      await Promise.all(
        keys.map(async key => redisDelete(key))
      )
    })
  )
}

export const validateApiSubmission = async (req, input) => {
  const { apiKey, samplingclientId: suspectSamplingClientId } = input

  const newRecord = {
    ...input
  }

  const [cacheUserNN, cacheSamplingClient] = await Promise.all([
    returnCachedUserNN(apiKey),
    returnCachedSamplingClient(suspectSamplingClientId)
  ])

  if (cacheSamplingClient) {
    newRecord.userId = cacheSamplingClient.userId
    newRecord.samplingclientId = cacheSamplingClient.samplingclientId
  }

  if (cacheUserNN) {
    newRecord.userId = cacheUserNN.userId // takes precedence because api is slightly more trusted
    newRecord.neuralnetworkId = cacheUserNN.neuralnetworkId
  }

  const user = !newRecord.userId && await returnTrustedUser(req)

  if (user) {
    newRecord.userId = user.id
  }

  const [neuralnetworkId, samplingclientId] = await Promise.all([
    !newRecord.neuralnetworkId && returnNeuralnetworkId(newRecord.userId, apiKey),
    !newRecord.samplingclientId && returnSamplingClientId(newRecord.userId, suspectSamplingClientId)
  ])

  if (neuralnetworkId) {
    newRecord.neuralnetworkId = neuralnetworkId
  }

  if (samplingclientId) {
    newRecord.samplingclientId = samplingclientId
  }

  return newRecord
}

const returnNeuralnetworkId = async (userId, apiKey) => {
  const neuralnetwork = await findDocument(NeuralNetwork, { userId, apiKey })
  if (!neuralnetwork) throw new AuthenticationError('API key is invalid')

  const { id: neuralnetworkId, apiKeyExpired, apiKeyExpires } = neuralnetwork
  if (await apiKeyExpired) throw new AuthenticationError('API key is expired')

  const expiresInSeconds = apiKeyExpires && expiresSeconds(apiKeyExpires)
  setCacheUserNN(apiKey, { userId, neuralnetworkId }, expiresInSeconds)
  return neuralnetworkId
}

const returnSamplingClientId = async (userId, suspectSamplingClientId) => {
  await SamplingClient.ensureEnabed({ userId, _id: suspectSamplingClientId })
  setCacheSamplingClient(suspectSamplingClientId, { userId, samplingclientId: suspectSamplingClientId }, REDIS_CACHE_EXPIRES_SECONDS_SAMPLING_CLIENT)
  return suspectSamplingClientId
}

export const returnCachedUserNN = async apiKey => {
  const cache = await redisGet(returnName(REDIS_CACHE_PREFIX_USERNN, apiKey))
  return cache && JSON.parse(cache)
}

export const returnCachedApikey = async (cacheValue) => {
  const cache = await redisGet(returnName(REDIS_CACHE_PREFIX_APIKEY, cacheValue))
  return cache && JSON.parse(cache)
}

export const returnCachedSamplingClient = async clientId => {
  const cache = await redisGet(returnName(REDIS_CACHE_PREFIX_SAMPLING_CLIENT, clientId))
  return cache && JSON.parse(cache)
}

export const setCacheUserNN = async (apiKey, cache, expiresInSeconds) => redisSet(returnName(REDIS_CACHE_PREFIX_USERNN, apiKey), JSON.stringify(cache), expiresInSeconds)

export const setCacheApikey = async (cacheValue, cache, expiresInSeconds) => redisSet(returnName(REDIS_CACHE_PREFIX_APIKEY, cacheValue), JSON.stringify(cache), expiresInSeconds)

export const setCacheSamplingClient = async (samplingclientId, cache, expiresInSeconds) => redisSet(returnName(REDIS_CACHE_PREFIX_SAMPLING_CLIENT, samplingclientId), JSON.stringify(cache), expiresInSeconds)

export const deleteCacheUserNN = async apiKey => {
  console.log('deleteCacheUserNN neeeds to delete apiKey sampleing clients cache')
  redisDelete(returnName(REDIS_CACHE_PREFIX_USERNN, apiKey))
}

export const deleteCacheApikey = async cacheValue => redisDelete(returnName(REDIS_CACHE_PREFIX_APIKEY, cacheValue))

export const deleteCacheSamplingClient = async samplingclientId => redisDelete(returnName(REDIS_CACHE_PREFIX_SAMPLING_CLIENT, samplingclientId))

const returnName = (prefix, id) => redisKey(id, prefix)

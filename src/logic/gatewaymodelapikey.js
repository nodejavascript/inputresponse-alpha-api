import { AuthenticationError } from 'apollo-server-express'
import { NeuralNetwork, SamplingClient } from '../models'
import { expiresSeconds, redisKey, redisSet, redisGet, redisDelete, redisKeys } from '../lib'
import { returnTrustedUser, findDocument } from './'

const { REDIS_CACHE_PREFIX_APIKEY, REDIS_CACHE_PREFIX_SAMPLING_CLIENT, REDIS_CACHE_EXPIRES_SECONDS_SAMPLING_CLIENT } = process.env

const keysToClear = ['APIKEY']

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
    newRecord.userId = cacheUserNN.userId // takes precidence because api is slightly more trusted
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
  const cache = await redisGet(returnName(REDIS_CACHE_PREFIX_APIKEY, apiKey))
  return cache && JSON.parse(cache)
}

export const returnCachedSamplingClient = async clientId => {
  const cache = await redisGet(returnName(REDIS_CACHE_PREFIX_SAMPLING_CLIENT, clientId))
  return cache && JSON.parse(cache)
}

export const setCacheUserNN = async (apiKey, modelSampleCache, expiresInSeconds) => redisSet(returnName(REDIS_CACHE_PREFIX_APIKEY, apiKey), JSON.stringify(modelSampleCache), expiresInSeconds)

export const setCacheSamplingClient = async (samplingclientId, samplingClientCache, expiresInSeconds) => redisSet(returnName(REDIS_CACHE_PREFIX_SAMPLING_CLIENT, samplingclientId), JSON.stringify(samplingClientCache), expiresInSeconds)

export const deleteCacheUserNN = async apiKey => redisDelete(returnName(REDIS_CACHE_PREFIX_APIKEY, apiKey))

export const deleteCacheSamplingClient = async samplingclientId => redisDelete(returnName(REDIS_CACHE_PREFIX_SAMPLING_CLIENT, samplingclientId))

const returnName = (prefix, id) => redisKey(id, prefix)

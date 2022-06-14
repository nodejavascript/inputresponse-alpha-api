import { AuthenticationError } from 'apollo-server-express'
import { NeuralNetwork, SamplingClient } from '../models'
import { expiresSeconds, redisKey, redisSet, redisGet, redisDelete } from '../lib'
import { returnTrustedUser, findDocument } from './'

const { REDIS_CACHE_PREFIX_APIKEY, REDIS_CACHE_PREFIX_SAMPLING_CLIENT, REDIS_CACHE_EXPIRES_SECONDS_SAMPLING_CLIENT } = process.env

export const returnNewModelSample = async (req, insertModelSampleInput) => {
  const { apiKey, samplingclientId: suspectSamplingClientId } = insertModelSampleInput

  const modelSample = {
    ...insertModelSampleInput
  }

  const [cacheUserNN, cacheSamplingClient] = await Promise.all([
    returnCachedUserNN(apiKey),
    returnCachedSamplingClient(suspectSamplingClientId)
  ])

  if (cacheSamplingClient) {
    modelSample.userId = cacheSamplingClient.userId
    modelSample.samplingclientId = cacheSamplingClient.samplingclientId
  }

  if (cacheUserNN) {
    modelSample.userId = cacheUserNN.userId // takes precidence because api is slightly more trusted
    modelSample.neuralnetworkId = cacheUserNN.neuralnetworkId
  }

  const user = !modelSample.userId && await returnTrustedUser(req)

  if (user) {
    modelSample.userId = user.id
  }

  const [neuralnetworkId, samplingclientId] = await Promise.all([
    !modelSample.neuralnetworkId && returnNeuralnetworkId(modelSample.userId, apiKey),
    !modelSample.samplingclientId && returnSamplingClientId(modelSample.userId, suspectSamplingClientId)
  ])

  if (neuralnetworkId) {
    modelSample.neuralnetworkId = neuralnetworkId
  }

  if (samplingclientId) {
    modelSample.samplingclientId = samplingclientId
  }

  return modelSample
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
  await SamplingClient.ensureValid({ userId, _id: suspectSamplingClientId })
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

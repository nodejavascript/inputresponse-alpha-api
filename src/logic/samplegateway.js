import { AuthenticationError } from 'apollo-server-express'
import { NeuralNetwork, SamplingClient } from '../models'
import { expiresSeconds, redisKey, redisSet, redisGet, redisDelete } from '../lib'
import { returnTrustedUser, findDocument } from './'

const { APIKEY_CACHE_PREFIX, SAMPLING_CLIENT_CACHE_PREFIX, SAMPLING_CLIENT_CACHE_EXPIRES_SECONDS } = process.env

export const returnNewModelSample = async (req, insertModelSampleInput) => {
  const { apiKey, samplingclientId: suspectSamplingclientId } = insertModelSampleInput

  const modelSample = {
    ...insertModelSampleInput
  }

  const [cacheUserNN, cacheSamplingClient] = await Promise.all([
    returnCachedUserNN(apiKey),
    returnCachedSamplingClient(suspectSamplingclientId)
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
    !modelSample.samplingclientId && returnSamplingclientId(modelSample.userId, suspectSamplingclientId)
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

const returnSamplingclientId = async (userId, suspectSamplingclientId) => {
  await SamplingClient.ensureValid({ userId, _id: suspectSamplingclientId })
  setCacheSamplingClient(suspectSamplingclientId, { userId, samplingclientId: suspectSamplingclientId }, SAMPLING_CLIENT_CACHE_EXPIRES_SECONDS)
  return suspectSamplingclientId
}

export const returnCachedUserNN = async apiKey => {
  const cache = await redisGet(returnName(APIKEY_CACHE_PREFIX, apiKey))
  return cache && JSON.parse(cache)
}

export const returnCachedSamplingClient = async clientId => {
  const cache = await redisGet(returnName(SAMPLING_CLIENT_CACHE_PREFIX, clientId))
  return cache && JSON.parse(cache)
}

export const setCacheUserNN = async (apiKey, modelSampleCache, expiresInSeconds) => redisSet(returnName(APIKEY_CACHE_PREFIX, apiKey), JSON.stringify(modelSampleCache), expiresInSeconds)

export const setCacheSamplingClient = async (samplingclientId, samplingClientCache, expiresInSeconds) => redisSet(returnName(SAMPLING_CLIENT_CACHE_PREFIX, samplingclientId), JSON.stringify(samplingClientCache), expiresInSeconds)

export const deleteCacheUserNN = async apiKey => redisDelete(returnName(APIKEY_CACHE_PREFIX, apiKey))

export const deleteCacheSamplingClient = async samplingclientId => redisDelete(returnName(SAMPLING_CLIENT_CACHE_PREFIX, samplingclientId))

const returnName = (prefix, id) => redisKey(id, prefix)

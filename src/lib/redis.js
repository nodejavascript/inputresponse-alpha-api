import { createClient } from 'redis'

const { HOSTNAME, REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS, REDIS_CONNECTION_TIMEOUT } = process.env

// if HOSTNAME exists, you are running production. HOSTNAME is not explicitly set running locally, at least not for me
const host = HOSTNAME ? 'redis' : REDIS_HOST

const redisClient = createClient({
  host,
  port: REDIS_PORT,
  user: REDIS_USER,
  password: REDIS_PASS,
  connect_timeout: REDIS_CONNECTION_TIMEOUT
}).on('error', (err) => redisError(err))

const redisStates = ['ready', 'connect', 'reconnecting', 'end', 'warning']

redisStates.forEach(state => redisClient.on(state, () => console.log('redis state:', state)))

export const connectToRedis = async () => {
  if (!redisClient) throw new Error('Can not connect to Redis')
  return redisClient
}

export const redisKey = (id, prefix) => `${prefix}_${id}`

export const redisSet = (name, value, expiresSeconds) => new Promise((resolve, reject) => {
  if (expiresSeconds) {
    redisClient.set(name, value, 'EX', Number(expiresSeconds), (err, res) => {
      if (err !== null) redisError(err) && reject(err)
      resolve(res)
    })
  } else {
    redisClient.set(name, value, (err, res) => {
      if (err !== null) redisError(err) && reject(err)
      resolve(res)
    })
  }
})

export const redisGet = name => new Promise((resolve, reject) => redisClient.get(name, (err, res) => {
  if (err !== null) redisError(err) && reject(err)
  resolve(res)
}))

export const redisDelete = name => new Promise((resolve, reject) => redisClient.del(name, (err, res) => {
  if (err !== null) redisError(err) && reject(err)
  resolve(res)
}))

export const redisKeys = prefix => new Promise((resolve, reject) => redisClient.keys(prefix + '*', (err, res) => {
  if (err !== null) redisError(err) && reject(err)
  resolve(res)
}))

const redisError = err => console.log('redisError', err)

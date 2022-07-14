import 'dotenv/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import helmet from 'helmet'
import cors from 'cors'
import http from 'http'
import internalIp from 'internal-ip'
import beep from 'beepbeep'
import path from 'path'

import routes from './routes'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import schemaDirectives from './directives'
import { launchMongo, createDockerVolume, connectToRedis, launchMqtt } from './lib'
import { clearRedisKeys } from './logic'

const { json } = express

const { NODE_ENV, APP_PORT } = process.env

const isLocal = NODE_ENV === 'local'
console.log('isLocal',isLocal)

const requestVetting = async (req, res) => {
  // these are incoming requests where you throw error before apollo query / mutation / subscription are executed
  return true
}

export const startGraphQLServer = async () => {
  try {
    await Promise.all([
      launchMongo(),
      createDockerVolume(), // uses DOCKER_VOLUME
      connectToRedis()
    ])

    await clearRedisKeys()

    const app = express()

    app.set('view engine', 'pug')
    app.set('views', path.join(__dirname, '/views'))
    app.use(express.static(path.join(__dirname, '/public')))

    const origin = []
    isLocal && origin.push('http://localhost:3000')
    isLocal && origin.push('http://10.0.0.39:4014')

    app.use(cors({
      origin,
      credentials: true
    }))

    const contentSecurityPolicy = isLocal ? false : undefined
    app.use(helmet({ contentSecurityPolicy }))

    app.disable('x-powered-by')

    app.get('/favicon.ico', (req, res) => res.sendStatus(204))
    app.use('/ping', routes.ping)

    app.use('/intelligence', routes.intelligence)

    app.use(json({ limit: '5mb' }))

    !isLocal && app.get('*', async (req, res, next) => {
      const err = new Error('404')
      err.status = 404
      res.sendStatus(404)
    })

    const playground = isLocal ? { settings: { 'request.credentials': 'include' } } : false
    const introspection = isLocal
    const debug = isLocal

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schemaDirectives,
      playground,
      introspection,
      debug,
      // formatResponse: (response, { context }) => {
      //   if (!response.data) return response
      //
      //   response.data.extensions = { duration: 20 }
      //   if (!context.res) return response
      //
      //   // context: you can specify more objects to append to `response.data` example setting res.extensions2 = { duration: 40 } in resolvers
      //
      //   return {
      //     ...context.res,
      //     ...response.data
      //   }
      // },
      context: async ({ req, res }) => {
        await requestVetting(req, res)
        return { req, res }
      }
    })

    server.applyMiddleware({ app, cors: false })

    const httpServer = http.createServer(app)
    server.installSubscriptionHandlers(httpServer)
    // server.graphqlPath, server.subscriptionsPath

    console.log('server.graphqlPath', server.graphqlPath)
    const [ip] = await Promise.all([
      internalIp.v4(),
      httpServer.listen({ port: APP_PORT }),
      launchMqtt()
    ])

    console.log(`server: http://${ip}:${APP_PORT}/graphql`)

    isLocal && beep(1)
  } catch (err) {
    console.error('halt and catch fire', err)
  }
}

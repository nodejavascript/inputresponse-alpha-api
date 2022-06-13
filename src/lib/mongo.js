import mongoose from 'mongoose'

const { MAIN_DB_USERNAME, MAIN_DB_PASSWORD, MAIN_DB_HOST, MAIN_DB_NAME, MAIN_DB_PORT, MAIN_DB_MAX_CONNECT } = process.env

const mongodbUri = `mongodb://${MAIN_DB_USERNAME}:${MAIN_DB_PASSWORD}@${MAIN_DB_HOST}:${MAIN_DB_PORT}/${MAIN_DB_NAME}?retryWrites=true&w=majority`

const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized']

const db = mongoose.createConnection(
  mongodbUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: MAIN_DB_MAX_CONNECT
  }
)

db.on('error', err => {
  console.log('mongoose connection err:', err)
})

// can expand on this
states.forEach(state => db.on(state, () => console.log('mongoose state:', state)))

export const launchMongo = async () => db

export const connectDatabase = () => db

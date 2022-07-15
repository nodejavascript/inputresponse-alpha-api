import MQTT from 'async-mqtt'
import { onMessage } from '../logic'

// await mqttPublish(`cmnd/${args.name}/Restart`, '1')
// const msg = `cmnd/${name}/${command}`
// setTimeout(() => {
//   return mqttPublish(msg, value)
// }, millis)

const { MQTT_HOST, MQTT_CLIENTID, MQTT_USERNAME, MQTT_PASSWORD } = process.env

const options = {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD
}

// https://www.npmjs.com/package/mqtt-connection
const returnClient = async clientOptions => MQTT.connectAsync(`tcp://${MQTT_HOST}:1883`, { ...options, ...clientOptions })

export const mqttPublish = async (topic, msg) => {
  const client = await returnClient({ clientId: 'mqtt-logger-publisher' })
  try {
    await client.publish(topic, msg)
    return client.end()
  } catch (e) {
    // Do something about it!
    console.log('Do something about it!', e.stack)
  }
}

export const launchMqtt = async () => {
  try {
    const client = await returnClient({ clientId: MQTT_CLIENTID })

    await client.subscribe('#')

    client.on('message', async (topic, message) => onMessage(topic, message))

    // connection error handling
    client.on('close', () => {
      console.log('client closed connection')
    })
    client.on('error', args => {
      console.log('error', JSON.stringify(args))
      client.destroy()
    })
    client.on('disconnect', args => {
      console.log('disconnect', JSON.stringify(args))
      client.destroy()
    })
  } catch (err) {
    console.log('try/catch', JSON.stringify(err))
  }
}

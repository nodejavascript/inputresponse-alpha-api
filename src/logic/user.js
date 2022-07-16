import { NeuralNetwork } from '../models'
import { returnTrustedUser, findDocument, findDocuments } from './'

export const returnUserNeuralNeworks = async req => {
  const { id: userId } = await returnTrustedUser(req)
  return findDocuments(NeuralNetwork, { userId })
}

export const returnEnabedUserNeuralNetwork = async (req, _id) => {
  const { id: userId } = await returnTrustedUser(req)
  const query = { _id, userId, enabled: true }

  return findDocument(NeuralNetwork, query)
}

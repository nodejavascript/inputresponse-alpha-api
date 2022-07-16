import { NeuralNetwork } from '../models'
import { returnTrustedUser, findDocument, findDocuments } from './'

export const returnUserNeuralNeworks = async req => {
  const { id: userId } = await returnTrustedUser(req)
  return findDocuments(NeuralNetwork, { userId })
}

export const returnUserNeuralNetwork = async (req, _id) => {
  const { id: userId } = await returnTrustedUser(req)
  const query = { _id, userId }

  return findDocument(NeuralNetwork, query)
}

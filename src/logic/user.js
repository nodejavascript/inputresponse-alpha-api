
import { NeuralNetwork } from '../models'
import { returnTrustedUser, findDocument, findDocuments } from './'

export const returnEnabedUserNeuralNetwork = async (req, _id) => {
  const { id: userId } = await returnTrustedUser(req)
  const query = { _id, userId }

  const [neuralnetwork] = await Promise.all([
    findDocument(NeuralNetwork, query),
    NeuralNetwork.ensureEnabed(query)
  ])

  return neuralnetwork
}

export const returnUserNeuralNeworks = async req => {
  const { id: userId } = await returnTrustedUser(req)
  return findDocuments(NeuralNetwork, { userId })
}

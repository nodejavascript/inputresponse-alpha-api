import { gql } from 'apollo-server-express'

export default gql`

  extend type Mutation {
    returnIntelligence (returnIntelligenceInput: ReturnIntelligenceInput!): ReturnIntelligenceOutput
    resetModel (resetModelInput: ResetModelInput!): ResetModelOutput
    saveNewDataToCache (saveNewDataToCacheInput: SaveNewDataToCacheInput!): SaveNewDataToCacheOutput
    saveNewDataToModel (saveNewDataToModelInput: SaveNewDataToModelInput!): Boolean
  }

  input TrainingInput {
    input: Object
    output: [Object]
  }

  input ReturnIntelligenceInput {
    key: String
    input: Object
    preTrainingData: [TrainingInput]
  }

  type ReturnIntelligenceOutput {
    key: String
    input: Object
    model: [Object]
    data: [Object]
    diagram: String
    likely: String
    guess: Object
    guessRounded: Int
    guessFloat: Float
    guessPercent: String
    confidenceLOW: String
    confidenceHIGH: String
    confidencePercent: String
  }


  input ResetModelInput {
    key: String
  }

  type ResetModelOutput {
    deleted: Boolean
    deletedIndex: Int
    userNeuralNetworksLength: Int
  }


  input SaveNewDataToCacheInput {
    key: String
    input: Object
    output: [Object]
  }

  type SaveNewDataToCacheOutput {
    cached: Boolean
    networkIndex: Int
    cachedLength: Int
  }

  input SaveNewDataToModelInput {
    key: String
  }

`

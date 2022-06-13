const dates = `
  createdAtAgo: String
  updatedAtAgo: String
  createdAt: String @date
  updatedAt: String @date
  createdAtUnix: String
  updatedAtUnix: String
`

const core = `
  order: Int
  name: String
  note: String
  imageURL: String
  enabled: Boolean
  archived: Boolean
`

// core
export const commonToCoreQueries = `
  id: ID!
  key: String
  ${core}
  ${dates}
`

export const commonToCoreMutations = `
  ${core}
`

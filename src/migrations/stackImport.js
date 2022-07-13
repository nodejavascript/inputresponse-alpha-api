import { asyncReadFile } from '../lib'

const { DOCKER_VOLUME } = process.env

const rootDirectory = DOCKER_VOLUME
const csvFilename = 'stack'
const ext = 'csv'

export const startStackImport = async () => {
  console.log('startStackImport')
  const theCSV = await asyncReadFile({ rootDirectory, csvFilename, ext })

  console.log('theCSV', theCSV)
}

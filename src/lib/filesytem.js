import path from 'path'
import readdir from '@jsdevtools/readdir-enhanced'
import mkdirp from 'mkdirp'
import readFile from 'fs-readfile-promise'
import writeFile from 'fs-writefile-promise'
import del from 'del'

const { NODE_ENV: env } = process.env

const rootPath = path.join(__dirname, '../../')

const returnPath = rootDirectory => path.join(rootPath, rootDirectory)

const returnFile = (rootDirectory, jsonFilename) => `${returnPath(rootDirectory)}/${jsonFilename}.json`

export const asyncReadDir = async ({ filter }) => readdir(rootPath, { filter })

export const asyncWriteDir = async ({ directory }) => mkdirp(returnPath(directory))

export const asyncWriteJSON = async ({ rootDirectory, jsonFilename, data }) => {
  const stringified = JSON.stringify(data)

  return writeFile(returnFile(rootDirectory, jsonFilename), stringified)
}

export const asyncReadJSON = async ({ rootDirectory, jsonFilename, encoding = 'utf8' }) => {
  const stringified = await readFile(returnFile(rootDirectory, jsonFilename), { encoding })
  return JSON.parse(stringified)
}

export const asyncDeleteJSON = async options => {
  const { rootDirectory, jsonFilename } = options
  return del([`${returnFile(rootDirectory, jsonFilename)}`])
}

export const returnAbout = async req => {
  const { name, version } = await asyncReadJSON({
    rootDirectory: './',
    jsonFilename: 'package'
  })
  const { headers } = req
  const { host, origin } = headers
  const userAgent = headers['user-agent']
  return { name, version, env, host, origin, userAgent }
}

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ms from 'ms'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

const { DATETIME_FORMAT } = process.env

export const fromNow = date => dayjs(date).fromNow()

export const toUnix = date => dayjs(date).unix()

export const returnExpires = expiresIn => dayjs().add(ms(expiresIn), 'millisecond').toISOString()

export const expiresSeconds = expires => dayjs(expires).diff(dayjs(), 'seconds')

export const checkExpired = expires => dayjs().isAfter(expires)

export const dayjsDefaultFormat = date => dayjs(date).format(DATETIME_FORMAT)

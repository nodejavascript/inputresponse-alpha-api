
export const getTickCount = () => (new Date()).getTime()

export const uniqArray = input => [...new Set(input.map(i => i.toString()))]

import { Router } from 'express'

import { returnIntelligence, saveNewDataToCache, saveNewDataToModel, resetModel } from '../lib'

// instance
const key = 'backgroundForegroundAI'

// setup
const preTrainingData = [
  { input: { r: 0, g: 0, b: 0 }, output: [1] },
  { input: { r: 1, g: 1, b: 1 }, output: [0] }
]
export default Router().get('/', async (req, res) => {
  const { prevInputString, answer, prevGuessRounded, add, reset } = req.query

  if (reset) {
    await resetModel(key)
    return res.redirect('/intelligence')
  }

  if (prevInputString) {
    const input = JSON.parse(prevInputString)
    const output = answer === 'correct' ? prevGuessRounded : Math.abs(parseInt(prevGuessRounded) - 1).toString()

    await saveNewDataToCache(key, input, [output])
    return res.redirect('/intelligence')
  }

  if (add) {
    await saveNewDataToModel(key)
    return res.redirect('/intelligence')
  }

  // start of request
  const input = () => {
    return {
      r: Math.random(),
      g: Math.random(),
      b: Math.random()
    }
  }

  const intelligence = await returnIntelligence(key, input(), preTrainingData)
  const intelligentResponse = returnIntelligentResponse(intelligence)

  return res.status(200).render('intelligence', intelligentResponse)
})

// process model response
const returnIntelligentResponse = intelligence => {
  const returnRgbCss = color => `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`
  const {
    input,
    model,
    data,
    guessRounded
  } = intelligence

  let newRecordsString = ''
  data.forEach(record => {
    newRecordsString += `${JSON.stringify(record)}\n`
  })

  const backgroundStyle = { padding: '12px' }
  backgroundStyle['text-align'] = 'center'
  backgroundStyle['background-color'] = returnRgbCss(input)

  const guessStyle = {
    color: guessRounded === 1 ? 'white' : 'black'
  }

  guessStyle['font-size'] = '32px'

  return {
    ...intelligence,
    prevInputString: JSON.stringify(input, null, 4),
    modelAsString: JSON.stringify(model),
    modelLength: model.length,
    newRecordsString,
    newRecordsLength: data.length,
    backgroundStyle,
    guessStyle
  }
}

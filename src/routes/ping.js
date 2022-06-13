import { Router } from 'express'

import { returnAbout } from '../lib'

export default Router().get('/', async (req, res) => res.status(200).json(await returnAbout(req)))

import { Router } from 'express'
import { heatMap, totalCounts } from '../controllers/home.js'
import { checkTokenAuth } from '../middlewares/checkTokenAuth.js'

const router = Router()

router.get('/heatMap', checkTokenAuth, heatMap)
router.get('/totalCounts', checkTokenAuth, totalCounts)

export default router
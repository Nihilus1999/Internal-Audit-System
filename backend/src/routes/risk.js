import { Router } from 'express'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { getRisks, getRiskById, createRisk, patchRiskById, getRisksFiltered, getAuditRisksFiltered } from '../controllers/risk.js'
import { validateRisk } from '../validators/risk.js'
import { checkTokenAuth } from '../middlewares/checkTokenAuth.js'

const router = Router()

router.get('/', checkRoleAuth("get.risk"), getRisks)
router.get('/filtered', checkTokenAuth, getRisksFiltered)
router.get('/audit-filtered', checkTokenAuth, getAuditRisksFiltered)
router.post('/', checkRoleAuth("create.risk"), validateRisk, createRisk)
router
    .route("/:id")
    .get(checkRoleAuth('get.risk'), getRiskById)
    .patch(checkRoleAuth('update.risk'), validateRisk, patchRiskById)

export default router
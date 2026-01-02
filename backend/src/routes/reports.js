import { Router } from 'express'
import { getAuditHoursBudget, getRisksMatrix, getAuditRisksMatrix, getAuditPlan, getAuditResultsReport } from '../controllers/reports.js'
/*import { checkRoleAuth, } from '../middlewares/checkRoleAuth.js'*/
import { checkTokenAuth } from '../middlewares/checkTokenAuth.js'

const router = Router()

router.get('/risks-matrix', checkTokenAuth, getRisksMatrix)
router.get('/audit-hours-budget', checkTokenAuth, getAuditHoursBudget)
router.get('/audit-risks-matrix', checkTokenAuth, getAuditRisksMatrix)
router.get('/audit-plan', checkTokenAuth, getAuditPlan)
router.get('/audit-results-report', checkTokenAuth, getAuditResultsReport)

export default router
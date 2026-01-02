import { Router } from 'express'
import { getAuditFindings } from '../controllers/auditFinding.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'

const router = Router()

router.get('/', checkRoleAuth("create.action_plan"), getAuditFindings)

export default router


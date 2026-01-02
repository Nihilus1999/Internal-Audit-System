import { Router } from 'express'
import { getCompany, updateCompany } from '../controllers/company.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { validateCompany } from '../validators/company.js'

const router = Router()

router.get('/', checkRoleAuth("get.company"), getCompany)
router.put('/', checkRoleAuth("update.company"), validateCompany, updateCompany)

export default router
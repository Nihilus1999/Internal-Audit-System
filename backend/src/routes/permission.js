import { Router } from 'express'
import { getPermissions } from '../controllers/permission.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'

const router = Router()

router.get('/', checkRoleAuth("get.role"), getPermissions)

export default router


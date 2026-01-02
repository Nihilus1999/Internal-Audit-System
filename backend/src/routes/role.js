import { Router } from 'express'
import { getRoles, getRoleById, createRole, updateRoleById } from '../controllers/role.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { validateRole } from '../validators/role.js'
import IdErrorHandler from '../helpers/handleIdError.js'

const router = Router()

router.get('/', checkRoleAuth("get.role"), getRoles)
router.post('/', checkRoleAuth("create.role"), validateRole, createRole)
router.param('id', IdErrorHandler)
router
    .route("/:id")
    .get(checkRoleAuth('get.role'), getRoleById)
    .put(checkRoleAuth('update.role'), validateRole, updateRoleById)

export default router
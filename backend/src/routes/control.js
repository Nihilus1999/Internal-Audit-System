import { Router } from 'express'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { getControls, getControlById, createControl, patchControlById } from '../controllers/control.js'
import { validateControl } from '../validators/control.js'

const router = Router()

router.get('/', checkRoleAuth("get.control"), getControls)
router.post('/', checkRoleAuth("create.control"), validateControl, createControl)
router
    .route("/:id")
    .get(checkRoleAuth('get.control'), getControlById)
    .patch(checkRoleAuth('update.control'), validateControl, patchControlById)

export default router
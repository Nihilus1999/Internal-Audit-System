import { Router } from 'express'
import { getProcesses, getProcessById, createProcess, updateProcessById } from '../controllers/process.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { validateProcess } from '../validators/process.js'

const router = Router()

router.get('/', checkRoleAuth("get.process"), getProcesses)
router.post('/', checkRoleAuth("create.process"), validateProcess, createProcess)
router
    .route("/:id")
    .get(checkRoleAuth('get.process'), getProcessById)
    .put(checkRoleAuth('update.process'), validateProcess, updateProcessById)

export default router
import { Router } from 'express'
import { getEvents, getEventById, reportEvent, updateEventById, getEventFiles, uploadEventFiles, downloadEventFile, deleteEventFile } from '../controllers/event.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { upload } from '../middlewares/uploadFiles.js'
import { validateEvent } from '../validators/event.js'

const router = Router()

router.get('/', checkRoleAuth("get.event"), getEvents)
router.post('/', checkRoleAuth("create.event"), validateEvent, reportEvent)
router
    .route("/:id")
    .get(checkRoleAuth('get.event'), getEventById)
    .put(checkRoleAuth('update.event'), validateEvent, updateEventById)
router
    .route("/files/:id") //Id del evento
    .get(checkRoleAuth("get.event"), getEventFiles)
    .post(checkRoleAuth("update.event"), upload.array('files'), uploadEventFiles)
//Id del file
router.get('/files/download/:id', checkRoleAuth("get.event"), downloadEventFile)
router.delete('/files/delete/:id', checkRoleAuth("update.event"), deleteEventFile)

export default router
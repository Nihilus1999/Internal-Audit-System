import { Router } from 'express'
import { getAllUsers, getUserById, createUser, getLoggedUser, updateLoggedUser, updateUserById, changePassword } from '../controllers/user.js'
import { validateUser } from '../validators/user.js'
import { checkRoleAuth } from '../middlewares/checkRoleAuth.js'
import { checkTokenAuth } from '../middlewares/checkTokenAuth.js'
import { validatePassword } from '../validators/password.js'
import IdErrorHandler from '../helpers/handleIdError.js'

const router = Router()

router
    .route("/profile")
    .get(checkTokenAuth, getLoggedUser)
    .put(checkTokenAuth, validateUser, updateLoggedUser)
router.put("/profile/change-password", checkTokenAuth, validatePassword, changePassword)

router.get('/', checkRoleAuth("get.user"), getAllUsers)
router.post('/', checkRoleAuth("create.user"), validateUser, createUser)
router.param('id', IdErrorHandler)
router  
    .route("/:id")
    .get(checkRoleAuth("get.user"), getUserById)
    .put(checkRoleAuth("update.user"), validateUser, updateUserById)

export default router
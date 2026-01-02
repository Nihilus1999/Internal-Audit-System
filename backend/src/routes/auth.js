import { Router } from 'express'
import { login, refreshAccessToken, sendOtpCode, verifyOtpCode, resetPassword } from '../controllers/auth.js'
import { validateLogin, validateOTP } from '../validators/auth.js'
import { validatePassword } from '../validators/password.js'

const router = Router()
router.post('/login', validateLogin, login)
router.post('/refresh-token', refreshAccessToken)
router.post('/request-reset', validateOTP, sendOtpCode)
router.post('/verify-otp', validateOTP, verifyOtpCode)
router.post('/reset-password', validateOTP, validatePassword, resetPassword)

export default router

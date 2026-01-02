import { check } from 'express-validator'
import { validateResult } from '../helpers/handleValidator.js'

export const validatePassword = [
    check('password')
        .exists()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .isLength({ max: 15 })
        .withMessage('La contraseña debe tener como máximo 15 caracteres')
        .matches(/^(?=.*[a-z])/)
        .withMessage('La contraseña debe contener al menos una letra minúscula')
        .matches(/^(?=.*[A-Z])/)
        .withMessage('La contraseña debe contener al menos una letra mayúscula')
        .matches(/^(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/^(?=.*[!@#$%^&*()\-_=+{};:,<.>])/)
        .withMessage('La contraseña debe contener al menos un carácter especial')
        .not()
        .matches(/\s/)
        .withMessage('La contraseña no debe contener espacios'),
    check('confirm_password')
        .exists()
        .withMessage('La confirmación de contraseña es obligatoria')
        .custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('Las contraseñas deben coincidir')
            return true
        }),
    (req, res, next) => {
        validateResult(req, res, next)
    }
]
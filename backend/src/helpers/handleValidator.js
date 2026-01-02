import { validationResult } from 'express-validator'
export const validateResult = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (err) {
        let errors = []
        for(const error of err.array()) {
            errors.push(error.msg)
        }
        res.status(403).json({ message: errors })
    }
}
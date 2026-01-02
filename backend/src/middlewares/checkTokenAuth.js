import { verifyToken } from '../helpers/handleToken.js'
export const checkTokenAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ').pop()
        const tokenData = await verifyToken(token)
        if (!tokenData) {
            return res.status(401).json({ message: ['Token inválido'] })
        }
        req.user = tokenData
        next()
    } catch (err) {
        return res.status(401).json({ message: ['Token inválido'] })
    }
}
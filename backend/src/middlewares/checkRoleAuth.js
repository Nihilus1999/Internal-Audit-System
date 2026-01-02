import { verifyToken } from '../helpers/handleToken.js'
import { userHasPermission } from '../helpers/handleUserPermission.js'
export const checkRoleAuth = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization.split(' ').pop()
            const tokenData = await verifyToken(token)
            const hasRequiredPermission = await userHasPermission(tokenData.id, requiredPermission)
            if (!hasRequiredPermission.ok) {
                if (hasRequiredPermission.reason === 'not_found') return res.status(410).json({ message: ['El usuario asociado al token no existe o se encuentra inactivo'] })
                return res.status(406).json({ message: ['No tienes el permiso para acceder aquí'] })
            }
            next()
        } catch (error) {
            return res.status(401).json({ message: ['Token inválido'] })
        }
    }
}
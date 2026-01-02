import { User } from '../models/user.js'
import { Role } from '../models/role.js'
import { Permission } from '../models/permission.js'

export const userHasPermission = async (userId, permissionKey) => {
    const data = await User.findByPk(userId, {
        include: {
            model: Role.unscoped(),
            include: [ { model: Permission, attributes: ['key'], through: { attributes: [] }, }, ],
        }
    })
    if (!data) return { ok: false, reason: 'not_found' }
    const hasPermission = data.role.permissions.some(
        (permission) => permission.key === permissionKey
    )
    if (!hasPermission) return { ok: false, reason: 'unauthorized' }
    return { ok: true }
}

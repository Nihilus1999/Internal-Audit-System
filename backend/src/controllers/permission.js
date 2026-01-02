import { Permission } from '../models/permission.js'
import { serverError } from '../helpers/handleServerError.js'

export const getPermissions = async (req, res) => {
    try {
        const data = await Permission.findAll()
        return res.json({ data })
    } catch(error) {
        serverError(res, error)
    }
}
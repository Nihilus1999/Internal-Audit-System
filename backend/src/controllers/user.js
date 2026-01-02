import { User } from '../models/user.js'
import { Role } from '../models/role.js'
import { Permission } from '../models/permission.js'
import { Company } from '../models/company.js'
import { encrypt } from '../helpers/handleBcrypt.js'
import { serverError } from '../helpers/handleServerError.js'
import { sendMail } from '../helpers/handleMailer.js'
import { generateUsername, generateSecurePassword } from '../helpers/handleCredentials.js'
import { sequelize }  from '../database/database.js'

export const getAllUsers = async (req, res) => {
    try {
        const data = await User.unscoped().findAll({
            attributes: { exclude: ['password'] },
            include: {
                model: Role.unscoped(),
                attributes: ['name'],
                include: [ { model: Permission, through: { attributes: [] }, }, ],
            }
        })
        res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const getUserById = async (req, res) => {
    try {
        const id  = req.params.id
        const data = await User.unscoped().findByPk(id, {
            attributes: { exclude: ['password'] },
            include: {
                model: Role.unscoped(),
                include: [ { model: Permission, through: { attributes: [] }, }, ],
            }
        })
        if (!data) return res.status(404).json({ message: ['Usuario no encontrado'] })
        res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const createUser = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { first_name, last_name, email, phone, id_role } = req.body
        const username = await generateUsername(first_name, last_name)
        const password = generateSecurePassword()
        const hashedPassword = await encrypt(password)
        const company = await Company.findOne({ where: { rif : 'J-401375855' } })
        if (!company) {
            await t.rollback()
            return res.status(404).json({ message: ['Compañía no encontrada'] })
        }        
        // Crear el usuario
        const user = await User.create({username, first_name, last_name, email, password: hashedPassword, phone, id_role, id_company: company.id }, { transaction: t })
        const data = await User.findByPk(user.id, {
            include: [{ model: Role }],
            transaction: t
        })
        //Enviar credenciales al usuario
        await sendMail({
            to: user.email,
            subject: 'Credenciales de Usuario - Sistema de Auditorías Internas',
            text: `Hola ${user.first_name},\n\nTus credenciales para el acceso al sistema son:\nUsuario: ${username}\nContraseña: ${password}\n\nPor favor, cambia tu contraseña después de iniciar sesión.`,
            html: `
                <p>Hola <strong>${user.first_name}</strong>,</p>
                <p>Tus credenciales para el acceso al sistema son:</p>
                <ul>
                    <li><strong>Usuario:</strong> ${username}</li>
                    <li><strong>Contraseña:</strong> ${password}</li>
                </ul>
                <p>Por favor, cambia tu contraseña después de iniciar sesión.</p>
            `,
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const getLoggedUser = async (req, res) => { 
    try {
        const data = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: {
                model: Role.unscoped(),
                include: [ { model: Permission, through: { attributes: [] }, }, ],
            }
        })
        if (!data) return res.status(404).json({ message: ['El usuario asociado al token no existe o se encuentra inactivo'] })
        res.json({ data })
    } catch (error) {
        serverError(res, error)
    }
}

export const updateLoggedUser = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { first_name, last_name, email, phone } = req.body
        const data = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: {
                model: Role.unscoped(),
                include: [ { model: Permission, through: { attributes: [] }, }, ],
            },
            transaction: t
        })
        if (!data){
            await t.rollback()
            return res.status(404).json({ message: ['El usuario asociado al token no existe o se encuentra inactivo'] })
        } 
        await data.update({ first_name, last_name, email, phone }, { transaction: t })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const updateUserById = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const id  = req.params.id
        const { first_name, last_name, email, phone, status, id_role } = req.body
        const user = await User.unscoped().findByPk(id, { transaction: t })
        if (!user){ 
            await t.rollback()
            return res.status(404).json({ message: ['El usuario no fue encontrado'] })
        } 
        await user.update({ first_name, last_name, email, phone, status, id_role }, { transaction: t })
        const data = await User.unscoped().findByPk(id, {
            attributes: { exclude: ['password'] },
            include: {
                model: Role,
                include: [ { model: Permission, through: { attributes: [] }, }, ],
            },
            transaction: t
        })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const changePassword = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const data = await User.findByPk(req.user.id, { transaction: t })
        const { password } = req.body
        if (!data){
            await t.rollback()
            return res.status(404).json({ message: ['El usuario asociado al token no existe o se encuentra inactivo'] })
        } 
        data.password = await encrypt(password)
        await data.save({ transaction: t })
        await t.commit()
        return res.json({ data })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

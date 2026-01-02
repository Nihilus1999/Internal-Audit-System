import { User } from '../models/user.js'
import { Role } from '../models/role.js'
import { Permission } from '../models/permission.js'
import { PasswordReset } from '../models/passwordReset.js'
import { sendMail } from '../helpers/handleMailer.js'
import { generateOTP } from '../helpers/handleOtp.js'
import { serverError } from '../helpers/handleServerError.js'
import { tokenSign } from '../helpers/handleToken.js'
import { verifyToken } from '../helpers/handleToken.js'
import { compare } from '../helpers/handleBcrypt.js'
import { encrypt } from '../helpers/handleBcrypt.js'
import { Op } from 'sequelize'
import { sequelize }  from '../database/database.js'


export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body
        // Buscar el usuario junto con el rol y sus permisos
        const data = await User.unscoped().findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
            include: [
                {
                    model: Role.unscoped(),
                    include: [ { model: Permission, through: { attributes: [] }, }, ],
                },
            ],
        })
        // Validar que el usuario con el identificador (usuario o correo) exista
        if (!data) {
            return res.status(401).json({ message: ['Las credenciales proporcionadas no son válidas'] })
        }
        //Validar que el usuario este activo
        if (!data.status) {
            return res.status(403).json({ message: ['Usuario inactivo'] })
        }
        // Validar que la contraseña sea correcta
        const checkPassword = await compare(password, data.password) 
        if (!checkPassword) {
            return res.status(401).json({ message: ['Las credenciales proporcionadas no son válidas'] })
        }
        // Generar el token de inicio de sesión y retornar
        const tokenSession = await tokenSign(data)
        return res.json({ data, tokenSession })
    } catch (error) {
        serverError(res, error)
    }
}

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.headers.authorization.split(' ').pop()
        const decodedToken = await verifyToken(refreshToken)
        const data = await User.unscoped().findByPk(decodedToken.id)
        if (data){
            const tokenSession = await tokenSign(data)
            return res.json({ tokenSession })
        } else {
            return res.status(404).json({ message: ['El usuario asociado al token no fue encontrado'] })
        }
    } catch (error) {
        return res.status(401).json({ message: ['Token invalido'] })
    }
}

export const sendOtpCode = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { email } = req.body
        // Verificar que el correo este registrado
        const data = await User.findOne({ where: { email } })
        if (!data) {
            await t.rollback()
            return res.status(404).json({ message: ['Correo no registrado o inactivo'] })
        }
        //Generar OTP y guardarlo en Base de Datos
        const otp_code = generateOTP()
        const expires_at = new Date(Date.now() + 5 * 60 * 1000)
        await PasswordReset.create({ id_user: data.id, otp_code, expires_at }, { transaction: t })
        // Enviar el correo
        await sendMail({
            to: email,
            subject: 'Código de recuperación de contraseña',
            text: `Tu código es: ${otp_code}`,
            html: `<p>Tu código OTP es: <strong>${otp_code}</strong></p><p>Expira en 5 minutos.</p>`,
        })
        await t.commit()
        return res.json({ message: ['Código enviado al correo electrónico'] })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}

export const verifyOtpCode = async (req, res) => {
    try {
        const { email, otp_code } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: ['Correo no registrado o inactivo'] })
        }
        const data = await PasswordReset.findOne({
            where: { id_user: user.id },
            order: [['created_at', 'DESC']],
        })
        if (!data || data.otp_code !== otp_code) {
            return res.status(403).json({ message: ['El código OTP no es valido'] })
        } 
        if (new Date() > data.expires_at) {
            await data.destroy()
            return res.status(400).json({ message: ['El código OTP ha expirado'] })
        }
        return res.json({ message: ['Código verificado correctamente'] })
    } catch (error) {
        serverError(res, error)
    }
}

export const resetPassword = async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { email, otp_code, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            await t.rollback()
            return res.status(404).json({ message: ['Correo no registrado o inactivo'] })
        }
        const data = await PasswordReset.findOne({
            where: { id_user: user.id },
            order: [['created_at', 'DESC']],
        })
        if (!data || data.otp_code !== otp_code) {
            await t.rollback()
            return res.status(403).json({ message: ['Correo electrónico o código OTP no validos'] })
        } 
        if (new Date() > data.expires_at) {
            await data.destroy({ transaction: t })
            await t.commit()
            return res.status(400).json({ message: ['El tiempo para cambiar la contraseña ha expirado'] })
        }
        //Se encripta y se guarda la nueva contraseña
        const hashedPassword = await encrypt(password)
        await User.update({ password: hashedPassword }, { where: { email }, transaction: t })
        //Se destruye el codigo OTP anterior
        await data.destroy({ transaction: t })
        await t.commit()
        return res.json({ message: ['Contraseña actualizada correctamente'] })
    } catch (error) {
        await t.rollback()
        serverError(res, error)
    }
}
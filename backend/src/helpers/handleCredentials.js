import { User } from '../models/user.js' // Importa el modelo de usuario
export const generateUsername = async (firstName, lastName) => {
    try {    
        const initials = firstName[0].toLowerCase()
        const cleanLastName = lastName.replace(/\s+/g, '').toLowerCase()
        const randomNumber = Math.floor(10 + Math.random() * 90)
        let username = `${initials}${cleanLastName}${randomNumber}`
        const existingUser = await User.findOne({ where: { username } })
        if (existingUser) return await generateUsername(firstName, lastName) 
        return username
    } catch (error) {
        throw new Error("No se pudo generar el username")
    }
}

export const generateSecurePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()-_=+{};:,<.>'
    const all = upper + lower + numbers + symbols
    let password = ''
    password += upper[Math.floor(Math.random() * upper.length)]
    password += lower[Math.floor(Math.random() * lower.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    for (let i = password.length; i < 12 + Math.floor(Math.random() * 4); i++) {
        password += all[Math.floor(Math.random() * all.length)]
    }
    return password
}
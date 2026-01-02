import crypto from 'crypto'

export const generateOTP = () => {
    const otp = crypto.randomInt(100000, 999999) // Genera un número aleatorio entre 100000 y 999999
    return otp.toString() // Convierte el número en un string para almacenarlo como texto
}

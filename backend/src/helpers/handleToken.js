import jwt from 'jsonwebtoken'
import fs from 'fs'

const privateKey = fs.readFileSync('./private.key', 'utf8')
const publicKey = fs.readFileSync('./public.key', 'utf8')

export const tokenSign = async (user) => { //Genera Token
    return jwt.sign(
        {
            id: user.id, 
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
        }, // Payload
        privateKey, // ENV 
        {
            algorithm: 'RS256',
            expiresIn: process.env.JWT_EXPIRATION, //Tiempo de vida
        }
    )
}

export const verifyToken = async (token) => { //Verifica el token con la llave publica
    try {
        return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
    } catch (e) {
        return null
    }
}

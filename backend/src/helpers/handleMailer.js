import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,              
    secure: false,          
    auth: {
        user: process.env.MAIL_USER || 'auditorias.consultores.j.d.g@gmail.com',
        pass: process.env.MAIL_PASS || 'pkso zcxa yjtq pkiu', 
    },
    tls: {
        rejectUnauthorized: false
    }
})

// Función para enviar el correo
export const sendMail = async ({ to, subject, text, html }) => {
    try {
        console.log(`Intentando conectar a Gmail por puerto 587 para enviar a: ${to}...`)
        
        const info = await transporter.sendMail({
            from: '"Consultores JDG - Auditorias Internas" <auditorias.consultores.j.d.g@gmail.com>',
            to,
            subject,
            text,
            html,
        })
        
        console.log('Correo enviado con éxito ID:', info.messageId)
        return info
    } catch (error) {
        console.error('Error FATAL al enviar correo:', error)
        throw error // Esto es importante para que tu controlador sepa que falló
    }
}
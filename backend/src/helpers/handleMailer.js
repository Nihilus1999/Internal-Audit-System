import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'consultoresjdg.auditorias@gmail.com',
        pass: 'bxjo gzud tjfc iqsx', //Clave de Smtp de Gmail
    },
})

// Función para enviar el correo
export const sendMail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: '"Consultores JDG - Auditorias Internas" <consultoresjdg.auditorias@gmail.com>', // Reemplaza con tu nombre y correo
            to,
            subject,
            text,
            html,
        })
        return info
    } catch (error) {
        console.error('Error al enviar correo:', error)
        throw error
    }
}

// Función para enviar un correo de prueba
/*export const sendTestEmail = async () => {
    try {
        await sendMail({
            to: 'asdrubal.asencio1@gmail.com', // Reemplaza con un correo de prueba
            subject: 'Prueba de Correo desde Gmail',
            text: 'Este es un correo de prueba enviado desde Nodemailer con Gmail.',
            html: '<h2>¡Hola!</h2><p>Este es un mensaje de prueba enviado correctamente a través de Gmail.</p>',
        });
        console.log('✅ Prueba de correo enviada.');
    } catch (error) {
        console.error('❌ Error en prueba de envío:', error);
    }
};*/
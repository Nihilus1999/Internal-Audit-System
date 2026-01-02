import { validate as validateUUID } from 'uuid'

const IdErrorHandler = (req, res, next) => {
    const id = req.params.id 
    if (id && !validateUUID(id)) {
        return res.status(400).json({ message: ['El parámetro proporcionado en la ruta no es un UUID válido'] })
    }
    next()
}

export default IdErrorHandler

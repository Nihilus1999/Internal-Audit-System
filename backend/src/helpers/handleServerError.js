export const serverError = (res, error) => {
    return res.status(500).json({
        message: [`Error: ${error?.message || 'Ocurrió un error inesperado'}`]
    })
}
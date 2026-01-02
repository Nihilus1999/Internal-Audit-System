const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      res.status(400).json({ message: ['JSON inválido'] })
    } else {
      next()
    }
}
  
export default jsonErrorHandler
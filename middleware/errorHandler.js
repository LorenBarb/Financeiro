function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join('; ') });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Registro duplicado' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message;

  res.status(statusCode).json({ message });
}

module.exports = errorHandler;

function validarEntrada(req, res, next) {
  const { fonte, valor, data, status } = req.body;
  const erros = [];

  if (!fonte || !['iFood', 'Uber', '99', 'Ajuste', 'Outro'].includes(fonte)) {
    erros.push('Fonte inválida');
  }

  if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) < 0) {
    erros.push('Valor deve ser um número positivo');
  }

  if (!data || isNaN(new Date(data).getTime())) {
    erros.push('Data inválida');
  }

  if (status && !['pendente', 'resgatado'].includes(status)) {
    erros.push('Status inválido');
  }

  if (erros.length > 0) {
    return res.status(400).json({ message: erros.join('; ') });
  }

  req.body.valor = Number(valor);
  next();
}

function validarSaida(req, res, next) {
  const { descricao, categoria, valor, data, status } = req.body;
  const erros = [];

  if (!descricao || descricao.trim().length === 0) {
    erros.push('Descrição é obrigatória');
  }

  if (!categoria || categoria.trim().length === 0) {
    erros.push('Categoria é obrigatória');
  }

  if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) < 0) {
    erros.push('Valor deve ser um número positivo');
  }

  if (!data || isNaN(new Date(data).getTime())) {
    erros.push('Data inválida');
  }

  if (status && !['em aberto', 'pago'].includes(status)) {
    erros.push('Status inválido');
  }

  if (erros.length > 0) {
    return res.status(400).json({ message: erros.join('; ') });
  }

  req.body.valor = Number(valor);
  req.body.isCustoNegocio = req.body.isCustoNegocio === true;
  next();
}

module.exports = { validarEntrada, validarSaida };

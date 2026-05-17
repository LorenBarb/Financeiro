const API_URL = '/api';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${path}`, options);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro de conexão' }));
    throw new Error(error.message || `Erro ${res.status}`);
  }

  return res.json();
}

async function carregarDados() {
  const [entradas, saidas] = await Promise.all([
    request('GET', '/entradas'),
    request('GET', '/saidas'),
  ]);
  return { entradas, saidas };
}

async function adicionarEntrada(data) {
  return request('POST', '/entradas', data);
}

async function adicionarSaida(formData) {
  const valorTotal = parseFloat(String(formData.valor).replace(',', '.'));
  const numParcelas = parseInt(formData.numParcelas) || 1;
  const valorParcela = valorTotal / numParcelas;
  const dataInicial = new Date(formData.data + 'T00:00:00');

  for (let i = 0; i < numParcelas; i++) {
    const dataParcela = new Date(dataInicial);
    dataParcela.setUTCMonth(dataInicial.getUTCMonth() + i);

    await request('POST', '/saidas', {
      descricao: `${formData.descricao}${numParcelas > 1 ? ` (${i + 1}/${numParcelas})` : ''}`,
      categoria: formData.categoria,
      valor: valorParcela,
      data: dataParcela.toISOString().split('T')[0],
      isCustoNegocio: formData.isCustoNegocio || false,
      status: formData.status,
      perfil: formData.perfil || '',
    });
  }
}

async function editarItem(type, id, data) {
  return request('PUT', `/${type}/${id}`, data);
}

async function removerItem(type, id) {
  return request('DELETE', `/${type}/${id}`);
}

async function deletarEmLote(type, ids) {
  return request('DELETE', `/${type}`, { ids });
}

async function atualizarStatusEmLote(type, ids, status) {
  return request('PUT', `/${type}/bulk-status`, { ids, status });
}

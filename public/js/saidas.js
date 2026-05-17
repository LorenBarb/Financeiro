let filtroSaidasState = { month: hoje.getUTCMonth(), year: hoje.getUTCFullYear(), category: 'todas', status: 'todos' };
let selectedSaidas = new Set();

function renderizarAbaSaidas() {
  const anos = getAnosDisponiveis();
  const selectClasses = "bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const inputClasses = "w-full bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const filterSelectClasses = "bg-input-bg border-border text-subtle-text text-xs rounded-md focus:ring-secondary focus:border-secondary block p-2 w-auto border";
  const buttonClasses = "w-full bg-secondary hover:bg-amber-600 text-dark-bg font-bold py-2.5 px-5 rounded-lg transition-colors";
  const iconButtonClasses = "p-1.5 rounded-md transition-colors duration-200";

  tabs.saidas.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1 bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border self-start">
        <h3 class="text-lg font-semibold mb-4 text-light-text">Adicionar Nova Saída</h3>
        <form id="formSaida" class="space-y-4">
          <div><label for="descricaoSaida" class="block text-sm font-medium text-subtle-text mb-1">Descrição</label><input type="text" id="descricaoSaida" class="${inputClasses}" required></div>
          <div><label for="categoriaSaida" class="block text-sm font-medium text-subtle-text mb-1">Categoria</label><select id="categoriaSaida" class="${selectClasses}"><option>Custo Fixo</option><option>Cartão de Crédito</option><option>Débito</option><option>Saque</option><option>Dízimo</option><option>Outro</option></select></div>
          <div><label for="valorSaida" class="block text-sm font-medium text-subtle-text mb-1">Valor Total</label><input type="text" inputmode="decimal" id="valorSaida" class="${inputClasses}" placeholder="150,00" required></div>
          <div><label for="dataSaida" class="block text-sm font-medium text-subtle-text mb-1">Data</label><input type="date" id="dataSaida" class="${inputClasses}" required></div>
          <div><label for="statusSaida" class="block text-sm font-medium text-subtle-text mb-1">Status</label><select id="statusSaida" class="${selectClasses}"><option value="em aberto">Em Aberto</option><option value="pago">Pago</option></select></div>
          <div id="parcelasContainer" class="hidden"><label for="numParcelas" class="block text-sm font-medium text-subtle-text mb-1">Nº de Parcelas</label><input type="number" id="numParcelas" class="${inputClasses}" value="1" min="1"></div>
          <div id="custoNegocioContainer"><div class="flex items-center"><input id="isCustoNegocio" type="checkbox" class="item-checkbox"><label for="isCustoNegocio" class="ml-2 block text-sm text-subtle-text">Custo do negócio</label></div></div>
          <button type="submit" class="${buttonClasses} mt-2">Adicionar Saída</button>
          <div id="saidaFeedback" class="text-sm hidden"></div>
        </form>
      </div>
      <div class="md:col-span-2 bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 class="text-lg font-semibold text-light-text flex-shrink-0">Histórico de Saídas</h3>
          <div class="flex flex-wrap items-center justify-start sm:justify-end gap-2" id="filtrosSaidas">
            <select id="filtroStatusSaidas" class="${filterSelectClasses}">
              <option value="todos" ${filtroSaidasState.status === 'todos' ? 'selected' : ''}>Todos</option>
              <option value="em aberto" ${filtroSaidasState.status === 'em aberto' ? 'selected' : ''}>Em Aberto</option>
              <option value="pago" ${filtroSaidasState.status === 'pago' ? 'selected' : ''}>Pago</option>
            </select>
            <select id="filtroCategoriaSaidas" class="${filterSelectClasses}">
              <option value="todas" ${filtroSaidasState.category === 'todas' ? 'selected' : ''}>Categorias</option>
              ${['Custo Fixo', 'Cartão de Crédito', 'Débito', 'Saque', 'Dízimo', 'Outro'].map(cat => `<option value="${cat}" ${filtroSaidasState.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
            <select id="filtroMesSaidas" class="${filterSelectClasses}">${MESES_NOME.map((mes, i) => `<option value="${i}" ${i === filtroSaidasState.month ? 'selected' : ''}>${mes}</option>`).join('')}</select>
            <select id="filtroAnoSaidas" class="${filterSelectClasses}">${anos.map(ano => `<option value="${ano}" ${ano === filtroSaidasState.year ? 'selected' : ''}>${ano}</option>`).join('')}</select>
          </div>
        </div>
        <div id="bulkActionsSaidas" class="hidden bg-slate-700/50 p-2 rounded-md mb-4 flex-wrap gap-2 items-center"></div>
        <div class="text-right font-bold text-lg mb-4 flex justify-between items-center border-b border-border pb-3">
          <div class="flex items-center gap-2 text-sm"><input type="checkbox" id="selectAllSaidas" class="item-checkbox"><label for="selectAllSaidas">Selecionar Tudo</label></div>
          <span id="totalValorSaidas" class="text-base"></span>
        </div>
        <div id="listaSaidas" class="overflow-auto max-h-[28rem] pr-2"></div>
      </div>
    </div>`;

  document.getElementById('categoriaSaida').addEventListener('change', (e) => {
    const isCartao = e.target.value === 'Cartão de Crédito';
    document.getElementById('parcelasContainer').classList.toggle('hidden', !isCartao);
  });

  document.getElementById('formSaida').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const isCartao = form.categoriaSaida.value === 'Cartão de Crédito';
    const valor = parseFloat(form.valorSaida.value.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) { showInfoModal('Valor inválido!'); return; }

    const feedback = document.getElementById('saidaFeedback');
    feedback.className = 'text-sm text-positive';
    feedback.textContent = 'Adicionando saída...';
    feedback.classList.remove('hidden');

    try {
      await adicionarSaida({
        descricao: form.descricaoSaida.value,
        categoria: form.categoriaSaida.value,
        valor: valor,
        data: form.dataSaida.value,
        numParcelas: isCartao ? form.numParcelas.value : 1,
        isCustoNegocio: form.isCustoNegocio.checked,
        status: form.statusSaida.value,
      });
      await carregarDadosCompletos();
      showToast('Saída adicionada com sucesso!');
    } catch (error) {
      feedback.className = 'text-sm text-negative';
      feedback.textContent = `Erro: ${error.message}`;
      return;
    }

    feedback.classList.add('hidden');
    form.reset();
    form.dataSaida.value = hojeISO();
    document.getElementById('parcelasContainer').classList.add('hidden');
  });

  document.getElementById('filtroMesSaidas').addEventListener('change', e => {
    filtroSaidasState.month = parseInt(e.target.value);
    renderizarListaSaidas();
  });
  document.getElementById('filtroAnoSaidas').addEventListener('change', e => {
    filtroSaidasState.year = parseInt(e.target.value);
    renderizarListaSaidas();
  });
  document.getElementById('filtroCategoriaSaidas').addEventListener('change', e => {
    filtroSaidasState.category = e.target.value;
    renderizarListaSaidas();
  });
  document.getElementById('filtroStatusSaidas').addEventListener('change', e => {
    filtroSaidasState.status = e.target.value;
    renderizarListaSaidas();
  });
  document.getElementById('selectAllSaidas').addEventListener('change', (e) => {
    document.querySelectorAll('#listaSaidas .item-checkbox').forEach(checkbox => {
      if (!checkbox.disabled) { checkbox.checked = e.target.checked; handleSaidaSelection(checkbox); }
    });
  });

  tabs.saidas.addEventListener('click', e => {
    const target = e.target.closest('.status-toggle-saida, .edit-btn, .delete-btn');
    if (!target) return;
    const id = target.dataset.id;
    const saida = saidas.find(s => s._id === id);
    if (saida && saida.entradaId) {
      showInfoModal('Este dízimo não pode ser alterado ou excluído diretamente. Altere a entrada original.');
      return;
    }
    if (target.classList.contains('status-toggle-saida')) alterarStatusSaida(id);
    if (target.classList.contains('edit-btn')) mostrarModalEditarSaida(id);
    if (target.classList.contains('delete-btn')) {
      showConfirmModal('Tem certeza que deseja excluir esta saída?', async () => { await removerItem('saidas', id); await carregarDadosCompletos(); showToast('Saída excluída'); });
    }
  });

  renderizarListaSaidas();
}

function handleSaidaSelection(checkbox) {
  if (checkbox.disabled) return;
  if (checkbox.checked) selectedSaidas.add(checkbox.dataset.id);
  else selectedSaidas.delete(checkbox.dataset.id);
  renderBulkActionsSaidas();
}

function renderBulkActionsSaidas() {
  const container = document.getElementById('bulkActionsSaidas');
  if (!container) return;
  if (selectedSaidas.size > 0) {
    const total = saidas.filter(s => selectedSaidas.has(s._id)).reduce((acc, s) => acc + s.valor, 0);
    container.innerHTML = `
      <span class="font-semibold text-sm mr-4">${selectedSaidas.size} selecionado(s) | Total: ${formatarDinheiro(total)}</span>
      <button onclick="atualizarStatusSelecionados('saidas', 'pago')" class="text-xs bg-positive text-white font-bold py-1 px-2 rounded">Marcar como Pago</button>
      <button onclick="atualizarStatusSelecionados('saidas', 'em aberto')" class="text-xs bg-warning text-dark-bg font-bold py-1 px-2 rounded">Marcar Em Aberto</button>
      <button onclick="removerItensSelecionados('saidas')" class="text-xs bg-negative text-white font-bold py-1 px-2 rounded">Excluir</button>`;
    container.classList.remove('hidden');
    container.classList.add('flex');
  } else {
    container.classList.add('hidden');
    container.classList.remove('flex');
    container.innerHTML = '';
  }
}

function renderizarListaSaidas() {
  const listaEl = document.getElementById('listaSaidas');
  if (!listaEl) return;
  const { month, year, category, status } = filtroSaidasState;
  const inicio = new Date(Date.UTC(year, month, 1));
  const fim = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const filtradas = saidas.filter(s => {
    const d = new Date(s.data);
    return d >= inicio && d <= fim &&
      (category === 'todas' || s.categoria === category) &&
      (status === 'todos' || s.status === status);
  });

  document.getElementById('totalValorSaidas').textContent = `Total: ${formatarDinheiro(filtradas.reduce((acc, s) => acc + s.valor, 0))}`;

  if (filtradas.length === 0) {
    listaEl.innerHTML = '<p class="text-subtle-text text-center py-4">Nenhuma saída encontrada.</p>';
    return;
  }

  const iconButtonClasses = "p-1.5 rounded-md transition-colors duration-200";
  let html = '<ul class="space-y-3">';
  filtradas.sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(s => {
    const isPago = s.status === 'pago', isDizimo = !!s.entradaId;
    html += `<li class="flex justify-between items-center p-3 rounded-md border border-border bg-slate-900/30 ${isDizimo ? 'opacity-60' : 'hover:border-secondary/50'}">
      <div class="flex items-center flex-grow gap-4">
        <input type="checkbox" data-id="${s._id}" onchange="handleSaidaSelection(this)" class="item-checkbox flex-shrink-0" ${selectedSaidas.has(s._id) ? 'checked' : ''} ${isDizimo ? 'disabled' : ''}>
        <div><p class="font-semibold text-light-text">${s.descricao}</p><p class="text-sm text-subtle-text">${s.categoria} - ${formatarData(s.data)}</p></div>
      </div>
      <div class="flex items-center gap-2">
        <div class="text-right">
          <p class="font-semibold text-negative">${formatarDinheiro(s.valor)}</p>
          <button data-id="${s._id}" class="status-toggle-saida text-sm font-medium ${isPago ? 'text-positive' : 'text-warning'}">${s.status}</button>
        </div>
        <button class="edit-btn text-subtle-text hover:text-secondary hover:bg-secondary/10 ${iconButtonClasses}" data-id="${s._id}" ${isDizimo ? 'disabled' : ''}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/></svg></button>
        <button class="delete-btn text-subtle-text hover:text-negative hover:bg-negative/10 ${iconButtonClasses}" data-id="${s._id}" ${isDizimo ? 'disabled' : ''}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"/></svg></button>
      </div></li>`;
  });
  listaEl.innerHTML = html + '</ul>';
}

function mostrarModalEditarSaida(id) {
  const saida = saidas.find(s => s._id === id);
  if (!saida) return;
  const dataValor = new Date(saida.data).toISOString().split('T')[0];
  const selectClasses = "bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const inputClasses = "w-full bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const buttonClasses = "w-full bg-secondary hover:bg-amber-600 text-dark-bg font-bold py-2.5 px-5 rounded-lg transition-colors";

  const content = `<div class="bg-card-bg text-primary rounded-lg shadow-xl w-full max-w-md m-4 border border-border">
    <div class="p-4 border-b border-border flex justify-between items-center">
      <h3 class="text-xl font-semibold text-light-text">Editar Saída</h3>
      <button class="close-modal-btn text-3xl text-subtle-text hover:text-light-text">&times;</button>
    </div>
    <form id="formEditSaida" class="p-6 space-y-4">
      <input type="hidden" name="id" value="${saida._id}">
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Descrição</label><input type="text" name="descricao" value="${saida.descricao}" class="${inputClasses}" required></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Categoria</label><select name="categoria" class="${selectClasses}"><option ${saida.categoria === 'Custo Fixo' ? 'selected' : ''}>Custo Fixo</option><option ${saida.categoria === 'Cartão de Crédito' ? 'selected' : ''}>Cartão de Crédito</option><option ${saida.categoria === 'Débito' ? 'selected' : ''}>Débito</option><option ${saida.categoria === 'Saque' ? 'selected' : ''}>Saque</option><option ${saida.categoria === 'Dízimo' ? 'selected' : ''}>Dízimo</option><option ${saida.categoria === 'Outro' ? 'selected' : ''}>Outro</option></select></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Valor</label><input type="text" inputmode="decimal" name="valor" value="${String(saida.valor).replace('.', ',')}" class="${inputClasses}" required></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Data</label><input type="date" name="data" value="${dataValor}" class="${inputClasses}" required></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Status</label><select name="status" class="${selectClasses}"><option value="em aberto" ${saida.status === 'em aberto' ? 'selected' : ''}>Em Aberto</option><option value="pago" ${saida.status === 'pago' ? 'selected' : ''}>Pago</option></select></div>
      <div class="flex items-center"><input id="editIsCustoNegocio" type="checkbox" name="isCustoNegocio" ${saida.isCustoNegocio ? 'checked' : ''} class="item-checkbox"><label for="editIsCustoNegocio" class="ml-2 block text-sm text-subtle-text">Custo do negócio</label></div>
      <div class="flex justify-end gap-2 pt-4">
        <button type="button" class="close-modal-btn py-2 px-4 rounded-md border border-border hover:bg-border">Cancelar</button>
        <button type="submit" class="${buttonClasses} !w-auto">Salvar</button>
      </div>
    </form>
  </div>`;
  showModal(modals.editSaida, content);
  document.getElementById('formEditSaida').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const valor = parseFloat(form.valor.value.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) { showInfoModal('Valor inválido!'); return; }
    try {
      await editarItem('saidas', form.id.value, { descricao: form.descricao.value, categoria: form.categoria.value, valor, data: form.data.value, isCustoNegocio: form.isCustoNegocio.checked, status: form.status.value });
      hideModal(modals.editSaida);
      await carregarDadosCompletos();
      showToast('Saída atualizada com sucesso!');
    } catch (error) {
      showInfoModal(`Erro: ${error.message}`);
    }
  });
}

async function alterarStatusSaida(id) {
  const saida = saidas.find(s => s._id === id);
  if (!saida) return;
  try {
    const novoStatus = saida.status === 'pago' ? 'em aberto' : 'pago';
    await editarItem('saidas', id, { status: novoStatus });
    await carregarDadosCompletos();
    showToast(`Saída marcada como ${novoStatus}`);
  } catch (error) {
    showInfoModal(`Erro: ${error.message}`);
  }
}

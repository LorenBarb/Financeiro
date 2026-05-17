let filtroEntradasState = { month: hoje.getUTCMonth(), year: hoje.getUTCFullYear(), source: 'todos', status: 'todos' };
let selectedEntradas = new Set();

function renderizarAbaEntradas() {
  const anos = getAnosDisponiveis();
  const selectClasses = "bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const inputClasses = "w-full bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const filterSelectClasses = "bg-input-bg border-border text-subtle-text text-xs rounded-md focus:ring-secondary focus:border-secondary block p-2 w-auto border";
  const buttonClasses = "w-full bg-secondary hover:bg-amber-600 text-dark-bg font-bold py-2.5 px-5 rounded-lg transition-colors";
  const iconButtonClasses = "p-1.5 rounded-md transition-colors duration-200";

  tabs.entradas.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-1 bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border self-start">
        <h3 class="text-lg font-semibold mb-4 text-light-text">Adicionar Nova Entrada</h3>
        <form id="formEntrada" class="space-y-4">
          <div><label for="fonteEntrada" class="block text-sm font-medium text-subtle-text mb-1">Fonte</label>
            <select id="fonteEntrada" class="${selectClasses}"><option>iFood</option><option>Uber</option><option>99</option><option>Ajuste</option><option>Outro</option></select></div>
          <div><label for="valorEntrada" class="block text-sm font-medium text-subtle-text mb-1">Valor Bruto</label>
            <input type="text" inputmode="decimal" id="valorEntrada" class="${inputClasses}" placeholder="150,00" required></div>
          <div>
            <label for="dataEntrada" class="block text-sm font-medium text-subtle-text mb-1">Data</label>
            <div class="date-input-container">
              <input type="text" id="displayDataEntrada" value="${formatarData(hojeISO())}" class="${inputClasses} date-input-display" readonly>
              <input type="date" id="dataEntrada" value="${hojeISO()}" class="date-input-native" required>
              <div class="date-input-icon">...</div>
            </div>
          </div>
          <div><label for="statusRepasse" class="block text-sm font-medium text-subtle-text mb-1">Status</label>
            <select id="statusRepasse" class="${selectClasses}"><option value="pendente">Pendente</option><option value="resgatado">Resgatado</option></select></div>
          <button type="submit" class="${buttonClasses} mt-2">Adicionar Entrada</button>
          <div id="entradaFeedback" class="text-sm hidden"></div>
        </form>
      </div>
      <div class="md:col-span-2 bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 class="text-lg font-semibold text-light-text flex-shrink-0">Histórico de Entradas</h3>
          <div class="flex flex-wrap items-center justify-start sm:justify-end gap-2" id="filtrosEntradas">
            <select id="filtroStatusEntradas" class="${filterSelectClasses}">
              <option value="todos" ${filtroEntradasState.status === 'todos' ? 'selected' : ''}>Todos</option>
              <option value="pendente" ${filtroEntradasState.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="resgatado" ${filtroEntradasState.status === 'resgatado' ? 'selected' : ''}>Resgatado</option>
            </select>
            <select id="filtroFonteEntradas" class="${filterSelectClasses}">
              <option value="todos" ${filtroEntradasState.source === 'todos' ? 'selected' : ''}>Todas</option>
              <option value="iFood" ${filtroEntradasState.source === 'iFood' ? 'selected' : ''}>iFood</option>
              <option value="Uber" ${filtroEntradasState.source === 'Uber' ? 'selected' : ''}>Uber</option>
              <option value="99" ${filtroEntradasState.source === '99' ? 'selected' : ''}>99</option>
              <option value="Ajuste" ${filtroEntradasState.source === 'Ajuste' ? 'selected' : ''}>Ajuste</option>
              <option value="Outro" ${filtroEntradasState.source === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
            <select id="filtroMesEntradas" class="${filterSelectClasses}">${MESES_NOME.map((mes, i) => `<option value="${i}" ${i === filtroEntradasState.month ? 'selected' : ''}>${mes}</option>`).join('')}</select>
            <select id="filtroAnoEntradas" class="${filterSelectClasses}">${anos.map(ano => `<option value="${ano}" ${ano === filtroEntradasState.year ? 'selected' : ''}>${ano}</option>`).join('')}</select>
          </div>
        </div>
        <div id="bulkActionsEntradas" class="hidden bg-slate-700/50 p-2 rounded-md mb-4 flex-wrap gap-2 items-center"></div>
        <div class="text-right font-bold text-lg mb-4 flex justify-between items-center border-b border-border pb-3">
          <div class="flex items-center gap-2 text-sm"><input type="checkbox" id="selectAllEntradas" class="item-checkbox"><label for="selectAllEntradas">Selecionar Tudo</label></div>
          <span id="totalValorEntradas" class="text-base"></span>
        </div>
        <div id="listaEntradas" class="overflow-auto max-h-[32rem] pr-2"></div>
      </div>
    </div>`;

  document.getElementById('dataEntrada').addEventListener('change', e => {
    document.getElementById('displayDataEntrada').value = formatarData(e.target.value);
  });

  document.getElementById('formEntrada').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const valor = parseFloat(form.valorEntrada.value.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      showInfoModal('Valor inválido! Digite um valor positivo.');
      return;
    }
    const feedback = document.getElementById('entradaFeedback');
    feedback.className = 'text-sm text-positive';
    feedback.textContent = 'Adicionando entrada...';
    feedback.classList.remove('hidden');

    try {
      await adicionarEntrada({
        fonte: form.fonteEntrada.value,
        valor: valor,
        data: form.dataEntrada.value,
        status: form.statusRepasse.value
      });
      await carregarDadosCompletos();
      showToast('Entrada adicionada com sucesso!');
    } catch (error) {
      feedback.className = 'text-sm text-negative';
      feedback.textContent = `Erro: ${error.message}`;
      return;
    }

    feedback.classList.add('hidden');
    form.reset();
    form.dataEntrada.value = hojeISO();
    form.querySelector('#displayDataEntrada').value = formatarData(hojeISO());
  });

  document.getElementById('filtroMesEntradas').addEventListener('change', e => {
    filtroEntradasState.month = parseInt(e.target.value);
    renderizarListaEntradas();
  });
  document.getElementById('filtroAnoEntradas').addEventListener('change', e => {
    filtroEntradasState.year = parseInt(e.target.value);
    renderizarListaEntradas();
  });
  document.getElementById('filtroFonteEntradas').addEventListener('change', e => {
    filtroEntradasState.source = e.target.value;
    renderizarListaEntradas();
  });
  document.getElementById('filtroStatusEntradas').addEventListener('change', e => {
    filtroEntradasState.status = e.target.value;
    renderizarListaEntradas();
  });
  document.getElementById('selectAllEntradas').addEventListener('change', (e) => {
    document.querySelectorAll('#listaEntradas .item-checkbox').forEach(checkbox => {
      checkbox.checked = e.target.checked;
      handleEntradaSelection(checkbox);
    });
  });

  tabs.entradas.addEventListener('click', e => {
    const target = e.target.closest('.status-toggle, .edit-btn, .delete-btn');
    if (!target) return;
    const id = target.dataset.id;
    if (target.classList.contains('status-toggle')) alterarStatusEntrada(id);
    if (target.classList.contains('edit-btn')) mostrarModalEditarEntrada(id);
    if (target.classList.contains('delete-btn')) {
      showConfirmModal('Tem certeza? Isso também excluirá o dízimo associado (se houver).', async () => { await removerItem('entradas', id); await carregarDadosCompletos(); showToast('Entrada excluída'); });
    }
  });

  renderizarListaEntradas();
}

function handleEntradaSelection(checkbox) {
  if (checkbox.checked) selectedEntradas.add(checkbox.dataset.id);
  else selectedEntradas.delete(checkbox.dataset.id);
  renderBulkActionsEntradas();
}

function renderBulkActionsEntradas() {
  const container = document.getElementById('bulkActionsEntradas');
  if (!container) return;
  if (selectedEntradas.size > 0) {
    const total = entradas.filter(e => selectedEntradas.has(e._id)).reduce((acc, e) => acc + e.valor, 0);
    container.innerHTML = `
      <span class="font-semibold text-sm mr-4">${selectedEntradas.size} selecionado(s) | Total: ${formatarDinheiro(total)}</span>
      <button onclick="atualizarStatusSelecionados('entradas', 'resgatado')" class="text-xs bg-positive text-white font-bold py-1 px-2 rounded">Marcar Resgatado</button>
      <button onclick="atualizarStatusSelecionados('entradas', 'pendente')" class="text-xs bg-warning text-dark-bg font-bold py-1 px-2 rounded">Marcar Pendente</button>
      <button onclick="removerItensSelecionados('entradas')" class="text-xs bg-negative text-white font-bold py-1 px-2 rounded">Excluir</button>`;
    container.classList.remove('hidden');
    container.classList.add('flex');
  } else {
    container.classList.add('hidden');
    container.classList.remove('flex');
    container.innerHTML = '';
  }
}

function renderizarListaEntradas() {
  const listaEl = document.getElementById('listaEntradas');
  if (!listaEl) return;
  const { month, year, source, status } = filtroEntradasState;
  const inicio = new Date(Date.UTC(year, month, 1));
  const fim = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const filtradas = entradas.filter(e => {
    const d = new Date(e.data);
    if (!(d >= inicio && d <= fim)) return false;
    if (source !== 'todos' && e.fonte !== source) return false;
    if (status === 'todos') return true;
    if (status === 'pendente') return e.status === 'pendente' || !e.status;
    if (status === 'resgatado') return e.status === 'resgatado' || e.status === 'repassado';
    return false;
  });

  document.getElementById('totalValorEntradas').textContent = `Total: ${formatarDinheiro(filtradas.reduce((acc, e) => acc + e.valor, 0))}`;

  if (filtradas.length === 0) {
    listaEl.innerHTML = '<p class="text-subtle-text text-center py-4">Nenhuma entrada encontrada.</p>';
    return;
  }

  const iconButtonClasses = "p-1.5 rounded-md transition-colors duration-200";
  let html = '<ul class="space-y-3">';
  filtradas.sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(e => {
    const isResgatado = e.status === 'resgatado' || e.status === 'repassado';
    html += `<li class="flex justify-between items-center p-3 rounded-md border border-border bg-slate-900/30 hover:border-secondary/50">
      <div class="flex items-center flex-grow gap-4">
        <input type="checkbox" data-id="${e._id}" onchange="handleEntradaSelection(this)" class="item-checkbox flex-shrink-0" ${selectedEntradas.has(e._id) ? 'checked' : ''}>
        <span class="w-3 h-3 rounded-full flex-shrink-0" style="background:${CORES_FONTES[e.fonte] || '#6B7280'}"></span>
        <div><p class="font-semibold text-light-text">${e.fonte}</p><p class="text-sm text-subtle-text">${formatarData(e.data)}</p></div>
      </div>
      <div class="flex items-center gap-2">
        <div class="text-right">
          <p class="font-semibold text-positive">${formatarDinheiro(e.valor)}</p>
          <button data-id="${e._id}" class="status-toggle text-sm font-medium ${isResgatado ? 'text-positive' : 'text-warning'}">${isResgatado ? 'resgatado' : 'pendente'}</button>
        </div>
        <button class="edit-btn text-subtle-text hover:text-secondary hover:bg-secondary/10 ${iconButtonClasses}" data-id="${e._id}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/></svg></button>
        <button class="delete-btn text-subtle-text hover:text-negative hover:bg-negative/10 ${iconButtonClasses}" data-id="${e._id}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"/></svg></button>
      </div></li>`;
  });
  listaEl.innerHTML = html + '</ul>';
}

function mostrarModalEditarEntrada(id) {
  const entrada = entradas.find(e => e._id === id);
  if (!entrada) return;
  const dataValor = new Date(entrada.data).toISOString().split('T')[0];
  const selectClasses = "bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const inputClasses = "w-full bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5";
  const buttonClasses = "w-full bg-secondary hover:bg-amber-600 text-dark-bg font-bold py-2.5 px-5 rounded-lg transition-colors";

  const content = `<div class="bg-card-bg text-primary rounded-lg shadow-xl w-full max-w-md m-4 border border-border">
    <div class="p-4 border-b border-border flex justify-between items-center">
      <h3 class="text-xl font-semibold text-light-text">Editar Entrada</h3>
      <button class="close-modal-btn text-3xl text-subtle-text hover:text-light-text">&times;</button>
    </div>
    <form id="formEditEntrada" class="p-6 space-y-4">
      <input type="hidden" name="id" value="${entrada._id}">
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Fonte</label><select name="fonte" class="${selectClasses}" required><option ${entrada.fonte === 'iFood' ? 'selected' : ''}>iFood</option><option ${entrada.fonte === 'Uber' ? 'selected' : ''}>Uber</option><option ${entrada.fonte === '99' ? 'selected' : ''}>99</option><option ${entrada.fonte === 'Ajuste' ? 'selected' : ''}>Ajuste</option><option ${entrada.fonte === 'Outro' ? 'selected' : ''}>Outro</option></select></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Valor Bruto</label><input type="text" inputmode="decimal" name="valor" value="${String(entrada.valor).replace('.', ',')}" class="${inputClasses}" required></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Data</label><input type="date" name="data" value="${dataValor}" class="${inputClasses}" required></div>
      <div><label class="block text-sm font-medium text-subtle-text mb-1">Status</label><select name="status" class="${selectClasses}" required><option value="pendente" ${entrada.status === 'pendente' ? 'selected' : ''}>Pendente</option><option value="resgatado" ${entrada.status === 'resgatado' ? 'selected' : ''}>Resgatado</option></select></div>
      <div class="flex justify-end gap-2 pt-4">
        <button type="button" class="close-modal-btn py-2 px-4 rounded-md border border-border hover:bg-border">Cancelar</button>
        <button type="submit" class="${buttonClasses} !w-auto">Salvar</button>
      </div>
    </form>
  </div>`;
  showModal(modals.editEntrada, content);
  document.getElementById('formEditEntrada').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const valor = parseFloat(form.valor.value.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) { showInfoModal('Valor inválido!'); return; }
    try {
      await editarItem('entradas', form.id.value, { fonte: form.fonte.value, valor, data: form.data.value, status: form.status.value });
      hideModal(modals.editEntrada);
      await carregarDadosCompletos();
      showToast('Entrada atualizada com sucesso!');
    } catch (error) {
      showInfoModal(`Erro: ${error.message}`);
    }
  });
}

async function alterarStatusEntrada(id) {
  const entrada = entradas.find(en => en._id === id);
  if (!entrada) return;
  const isResgatado = entrada.status === 'resgatado' || entrada.status === 'repassado';
    try {
      await editarItem('entradas', id, { status: isResgatado ? 'pendente' : 'resgatado' });
      await carregarDadosCompletos();
      showToast(`Entrada marcada como ${isResgatado ? 'pendente' : 'resgatado'}`);
    } catch (error) {
    showInfoModal(`Erro: ${error.message}`);
  }
}

function removerItensSelecionados(type) {
  const ids = Array.from(type === 'entradas' ? selectedEntradas : selectedSaidas);
  if (ids.length === 0) return;
  const message = type === 'entradas'
    ? `Tem certeza que deseja excluir os ${ids.length} itens selecionados? Os dízimos associados também serão excluídos.`
    : `Tem certeza que deseja excluir os ${ids.length} itens selecionados? (Dízimos automáticos não podem ser excluídos por aqui).`;

  showConfirmModal(message, async () => {
    try {
      await deletarEmLote(type, ids);
      if (type === 'entradas') selectedEntradas.clear(); else selectedSaidas.clear();
      await carregarDadosCompletos();
      showToast(`${ids.length} itens excluídos com sucesso!`);
    } catch (error) {
      showInfoModal(`Erro: ${error.message}`);
    }
  });
}

function atualizarStatusSelecionados(type, status) {
  const ids = Array.from(type === 'entradas' ? selectedEntradas : selectedSaidas);
  if (ids.length === 0) return;
  showConfirmModal(`Tem certeza que deseja alterar o status de ${ids.length} itens para "${status}"?`, async () => {
    try {
      await atualizarStatusEmLote(type, ids, status);
      if (type === 'entradas') selectedEntradas.clear(); else selectedSaidas.clear();
      await carregarDadosCompletos();
      showToast(`${ids.length} itens atualizados para "${status}"!`);
    } catch (error) {
      showInfoModal(`Erro: ${error.message}`);
    }
  });
}

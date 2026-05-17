const FONTES_VALIDAS = ['iFood', 'Uber', '99', 'Salário', 'Vale Refeição', 'Vale Alimentação', 'Cartão Alvo', 'Ajuste', 'Outro'];
const CATEGORIAS_SAIDA = ['Custo Fixo', 'Cartão de Crédito', 'Débito', 'Saque', 'Dízimo', 'Outro'];

const MESES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CORES_FONTES = {
  'iFood': '#EA1D2C', 'Uber': '#000000', '99': '#FFC700',
  'Salário': '#22c55e', 'Vale Refeição': '#14b8a6',
  'Vale Alimentação': '#8b5cf6', 'Cartão Alvo': '#f97316',
  'Ajuste': '#3b82f6', 'Outro': '#6B7280'
};

const CORES_SAIDAS = {
  'Cartão de Crédito': '#ef4444', 'Dízimo': '#FFD700',
  'Custo Fixo': '#22c55e', 'Débito': '#6366F1',
  'Saque': '#EC4899', 'Outro': '#84CC16'
};

const CORES_PERFIS = {
  '': '#94a3b8',
  'Família': '#3b82f6',
  'João': '#22c55e',
  'Maria': '#ec4899',
};

const brasilDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric', month: '2-digit', day: '2-digit'
});
const hojeBrasilString = brasilDateFormatter.format(new Date());
const [ano, mes, dia] = hojeBrasilString.split('-').map(Number);
const hoje = new Date(Date.UTC(ano, mes - 1, dia));

const hojeISO = () => hojeBrasilString;

const formatarDinheiro = (valor) =>
  (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (dataStr) => {
  if (!dataStr || !dataStr.includes('-')) return '';
  const date = new Date(dataStr);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const getContrastColor = (hexcolor) => {
  if (!hexcolor) return '#000000';
  if (hexcolor.startsWith('#')) hexcolor = hexcolor.slice(1);
  if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(c => c + c).join('');
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#0f172a' : '#ffffff';
};

function showLoading(containerEl) {
  if (containerEl) {
    containerEl.innerHTML = `
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        <span class="ml-3 text-subtle-text">Carregando...</span>
      </div>`;
  }
}

// Modais
function showModal(modal, content) {
  modal.innerHTML = content;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const closeBtn = modal.querySelector('.close-modal-btn');
  if (closeBtn) closeBtn.addEventListener('click', () => hideModal(modal));
  modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(modal); });
}

function hideModal(modal) {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.innerHTML = '';
}

function showConfirmModal(message, onConfirm) {
  const content = `
    <div class="bg-card-bg rounded-lg shadow-xl w-full max-w-md m-4 text-primary border border-border">
      <div class="p-6 text-center">
        <svg class="mx-auto mb-4 h-12 w-12 text-warning" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
        <p class="mb-5 text-lg font-normal text-subtle-text">${message}</p>
        <button id="confirmBtn" class="text-white bg-negative hover:bg-red-700 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">Sim, tenho certeza</button>
        <button id="cancelBtn" class="text-subtle-text bg-transparent hover:bg-border border border-border font-medium rounded-lg text-sm px-5 py-2.5">Não, cancelar</button>
      </div>
    </div>`;
  showModal(modals.deleteConfirm, content);
  document.getElementById('confirmBtn').onclick = () => { onConfirm(); hideModal(modals.deleteConfirm); };
  document.getElementById('cancelBtn').onclick = () => { hideModal(modals.deleteConfirm); };
}

function showInfoModal(message) {
  const content = `
    <div class="bg-card-bg rounded-lg shadow-xl w-full max-w-md m-4 text-primary border border-border">
      <div class="p-6 text-center">
        <svg class="mx-auto mb-4 h-12 w-12 text-neutral" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
        <p class="mb-5 text-lg font-normal text-subtle-text">${message}</p>
        <button class="close-modal-btn w-full bg-secondary hover:bg-amber-600 text-dark-bg font-bold py-2.5 px-5 rounded-lg transition-colors">OK</button>
      </div>
    </div>`;
  showModal(modals.info, content);
}

// --- GERENCIAMENTO DE PERFIS ---
function getPerfis() {
  try {
    const salvos = localStorage.getItem('financeiro_perfis');
    if (salvos) return JSON.parse(salvos);
  } catch (e) { /* ignore */ }
  return ['', 'Família', 'João', 'Maria'];
}

function salvarPerfis(perfis) {
  localStorage.setItem('financeiro_perfis', JSON.stringify(perfis));
}

function getCorPerfil(perfil) {
  return CORES_PERFIS[perfil] || '#6366F1';
}

function renderizarModalGerenciarPerfis() {
  let perfis = getPerfis();
  const optionsHtml = perfis.filter(p => p).map(p => `<option value="${p}">${p}</option>`).join('');
  const content = `
    <div class="bg-card-bg rounded-lg shadow-xl w-full max-w-md m-4 text-primary border border-border">
      <div class="p-4 border-b border-border flex justify-between items-center">
        <h3 class="text-xl font-semibold text-light-text">Gerenciar Perfis</h3>
        <button class="close-modal-btn text-3xl text-subtle-text hover:text-light-text">&times;</button>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex gap-2">
          <input type="text" id="novoPerfilInput" class="w-full bg-input-bg border border-border text-light-text text-sm rounded-lg focus:ring-secondary focus:border-secondary block p-2.5" placeholder="Novo perfil...">
          <button id="adicionarPerfilBtn" class="bg-secondary hover:bg-amber-600 text-dark-bg font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0">+</button>
        </div>
        <select id="listaPerfis" size="5" class="w-full bg-input-bg border border-border text-light-text text-sm rounded-lg p-2" style="min-height:120px">${optionsHtml}</select>
        <div class="flex gap-2">
          <button id="renomearPerfilBtn" class="bg-neutral text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Renomear</button>
          <button id="removerPerfilBtn" class="bg-negative text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Remover</button>
        </div>
        <p class="text-xs text-subtle-text">Os perfis aparecem nos formulários e filtros de entrada e saída.</p>
      </div>
    </div>`;
  showModal(modals.info, content);

  document.getElementById('adicionarPerfilBtn').addEventListener('click', () => {
    const input = document.getElementById('novoPerfilInput');
    const nome = input.value.trim();
    if (!nome) return;
    let lista = getPerfis();
    if (!lista.includes(nome)) {
      lista.push(nome);
      salvarPerfis(lista);
      renderizarModalGerenciarPerfis();
    }
    input.value = '';
  });

  document.getElementById('renomearPerfilBtn').addEventListener('click', () => {
    const select = document.getElementById('listaPerfis');
    const antigo = select.value;
    if (!antigo) return;
    const novo = prompt('Novo nome para "' + antigo + '":');
    if (!novo || novo === antigo) return;
    let lista = getPerfis();
    const idx = lista.indexOf(antigo);
    if (idx >= 0) {
      lista[idx] = novo;
      salvarPerfis(lista);
      renderizarModalGerenciarPerfis();
    }
  });

  document.getElementById('removerPerfilBtn').addEventListener('click', () => {
    const select = document.getElementById('listaPerfis');
    const nome = select.value;
    if (!nome) return;
    if (!confirm(`Remover perfil "${nome}"?`)) return;
    let lista = getPerfis();
    const idx = lista.indexOf(nome);
    if (idx >= 0) {
      lista.splice(idx, 1);
      salvarPerfis(lista);
      renderizarModalGerenciarPerfis();
    }
  });
}

function showToast(message, type = 'success') {
  const colors = { success: 'bg-positive', error: 'bg-negative', warning: 'bg-warning', info: 'bg-neutral' };
  const bgColor = colors[type] || 'bg-neutral';
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

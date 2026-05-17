// Estado global
let entradas = [];
let saidas = [];

const tabs = {
  dashboard: document.getElementById('dashboard'),
  entradas: document.getElementById('entradas'),
  saidas: document.getElementById('saidas'),
  relatorios: document.getElementById('relatorios'),
};

const modals = {
  editEntrada: document.getElementById('editEntradaModal'),
  editSaida: document.getElementById('editSaidaModal'),
  deleteConfirm: document.getElementById('deleteConfirmModal'),
  info: document.getElementById('infoModal'),
};

async function carregarDadosCompletos() {
  try {
    const dados = await carregarDados();
    entradas = dados.entradas;
    saidas = dados.saidas;
    renderizarFiltrosDashboard();
    atualizarDashboard();
    renderizarConteudoDasAbas();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showInfoModal('Não foi possível carregar os dados do servidor. Tente recarregar a página.');
  }
}

function renderizarConteudoDasAbas() {
  renderizarAbaEntradas();
  renderizarAbaSaidas();
  renderizarAbaRelatorios();
}

// Navegação por abas
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('nav').addEventListener('click', (e) => {
    const button = e.target.closest('.tab-button');
    if (button) {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      Object.values(tabs).forEach(t => t.classList.add('hidden'));
      const tab = tabs[button.dataset.tab];
      tab.classList.remove('hidden');
      if (button.dataset.tab === 'relatorios') {
        renderizarAbaRelatorios();
      }
    }
  });

  document.getElementById('btnGerenciarPerfis').addEventListener('click', (e) => {
    e.stopPropagation();
    renderizarModalGerenciarPerfis();
  });

  carregarDadosCompletos();
});

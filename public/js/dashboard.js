let filtroDashboardState = { month: hoje.getUTCMonth(), year: hoje.getUTCFullYear() };

function getAnosDisponiveis() {
  const todosAnos = new Set([...entradas, ...saidas].map(item => new Date(item.data).getUTCFullYear()));
  const anoAtual = new Date().getFullYear();
  todosAnos.add(anoAtual);
  for (let i = 1; i <= 5; i++) todosAnos.add(anoAtual + i);
  return Array.from(todosAnos).sort((a, b) => b - a);
}

function calcularTotais() {
  const { month, year } = filtroDashboardState;
  const inicioMesFiltro = new Date(Date.UTC(year, month, 1));
  const fimMesFiltro = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const entradasAnteriores = entradas.filter(e => new Date(e.data) < inicioMesFiltro);
  const saidasPagasAnteriores = saidas.filter(s => new Date(s.data) < inicioMesFiltro && s.status === 'pago');
  const saldoMesAnterior = entradasAnteriores.reduce((a, e) => a + e.valor, 0) - saidasPagasAnteriores.reduce((a, s) => a + s.valor, 0);

  const entradasPeriodo = entradas.filter(e => { const d = new Date(e.data); return d >= inicioMesFiltro && d <= fimMesFiltro; });
  const saidasPeriodo = saidas.filter(s => { const d = new Date(s.data); return d >= inicioMesFiltro && d <= fimMesFiltro; });

  const totalEntradas = entradasPeriodo.reduce((a, e) => a + e.valor, 0);
  const totalPagamentosRealizados = saidasPeriodo.filter(s => s.status === 'pago').reduce((a, s) => a + s.valor, 0);
  const totalValoresEmAberto = saidasPeriodo.filter(s => s.status === 'em aberto').reduce((a, s) => a + s.valor, 0);
  const gastosPrevistosFuturos = saidas.filter(s => new Date(s.data) > fimMesFiltro && s.status === 'em aberto').reduce((a, s) => a + s.valor, 0);

  return { saldoMesAnterior, totalEntradas, totalPagamentosRealizados, totalValoresEmAberto, gastosPrevistosFuturos, entradasPeriodo, saidasPeriodo };
}

function renderizarDashboard(data) {
  const saldoAtual = data.saldoMesAnterior + data.totalEntradas - data.totalPagamentosRealizados;
  const saldoPrevistoFinal = saldoAtual - data.totalValoresEmAberto;

  const setCardValue = (id, value, positiveClass, negativeClass, neutralClass) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = formatarDinheiro(value);
    el.className = el.className.replace(/text-\w+/g, '');
    el.classList.add(value >= 0 ? positiveClass : negativeClass);
  };

  setCardValue('cardSaldoAnterior', data.saldoMesAnterior, 'text-positive', 'text-negative');
  document.getElementById('cardEntradas').textContent = formatarDinheiro(data.totalEntradas);
  document.getElementById('cardPagamentosRealizados').textContent = formatarDinheiro(data.totalPagamentosRealizados);
  document.getElementById('cardValoresEmAberto').textContent = formatarDinheiro(data.totalValoresEmAberto);
  setCardValue('cardSaldoAtual', saldoAtual, 'text-saved', 'text-negative');
  setCardValue('cardSaldoPrevistoMes', saldoPrevistoFinal, 'text-positive', 'text-negative');
  document.getElementById('cardGastosPrevistos').textContent = formatarDinheiro(data.gastosPrevistosFuturos);

  const nomeFiltro = `${MESES_NOME[filtroDashboardState.month]}/${filtroDashboardState.year}`;
  document.querySelectorAll('.periodo-label').forEach(el => el.textContent = nomeFiltro);

  renderizarResumoMetas(data, saldoAtual);
  renderizarGraficosDashboard(data.entradasPeriodo, data.saidasPeriodo);
}

function renderizarResumoMetas(data, saldoAtual) {
  const container = document.getElementById('resumoMetasContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="bg-neutral/10 border-l-4 border-neutral text-primary p-4 rounded-md text-sm space-y-2">
      <div class="flex justify-between"><span>Saldo Anterior:</span> <strong class="${data.saldoMesAnterior >= 0 ? 'text-positive' : 'text-negative'}">${formatarDinheiro(data.saldoMesAnterior)}</strong></div>
      <div class="flex justify-between"><span>+ Entradas do Mês:</span> <strong class="text-positive">${formatarDinheiro(data.totalEntradas)}</strong></div>
      <div class="flex justify-between"><span>- Pagamentos do Mês:</span> <strong class="text-negative">${formatarDinheiro(data.totalPagamentosRealizados)}</strong></div>
      <div class="flex justify-between border-t border-border pt-2 mt-2"><span>= Saldo Atual:</span> <strong class="${saldoAtual >= 0 ? 'text-saved' : 'text-negative'}">${formatarDinheiro(saldoAtual)}</strong></div>
      <div class="flex justify-between"><span>- A Pagar no Mês:</span> <strong class="text-warning">${formatarDinheiro(data.totalValoresEmAberto)}</strong></div>
      <div class="flex justify-between pt-1"><span class="font-semibold">= Saldo Previsto:</span> <strong class="${(saldoAtual - data.totalValoresEmAberto) >= 0 ? 'text-positive' : 'text-negative'}">${formatarDinheiro(saldoAtual - data.totalValoresEmAberto)}</strong></div>
    </div>`;
}

function renderizarFiltrosDashboard() {
  const container = document.getElementById('dashboardFiltersContainer');
  if (!container) return;
  const anos = getAnosDisponiveis();
  container.innerHTML = `
    <div class="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-6 gap-y-2">
      <div class="flex items-center gap-2">
        <label for="filtroMesDashboard" class="text-sm font-medium text-subtle-text">Mês:</label>
        <select id="filtroMesDashboard" class="bg-input-bg border-border text-subtle-text text-xs rounded-md focus:ring-secondary focus:border-secondary block p-2 w-auto border">
          ${MESES_NOME.map((mes, i) => `<option value="${i}" ${i === filtroDashboardState.month ? 'selected' : ''}>${mes}</option>`).join('')}
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label for="filtroAnoDashboard" class="text-sm font-medium text-subtle-text">Ano:</label>
        <select id="filtroAnoDashboard" class="bg-input-bg border-border text-subtle-text text-xs rounded-md focus:ring-secondary focus:border-secondary block p-2 w-auto border">
          ${anos.map(ano => `<option value="${ano}" ${ano === filtroDashboardState.year ? 'selected' : ''}>${ano}</option>`).join('')}
        </select>
      </div>
    </div>`;

  document.getElementById('filtroMesDashboard').addEventListener('change', e => {
    filtroDashboardState.month = parseInt(e.target.value);
    atualizarDashboard();
  });
  document.getElementById('filtroAnoDashboard').addEventListener('change', e => {
    filtroDashboardState.year = parseInt(e.target.value);
    atualizarDashboard();
  });
}

function atualizarDashboard() {
  const totais = calcularTotais();
  renderizarDashboard(totais);
}

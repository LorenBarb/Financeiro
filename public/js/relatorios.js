function renderizarAbaRelatorios() {
  const anos = getAnosDisponiveis().sort((a, b) => a - b);
  const anosDesc = [...anos].sort((a, b) => b - a);
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth();
  const filterSelectClasses = "bg-input-bg border-border text-subtle-text text-xs rounded-md focus:ring-secondary focus:border-secondary block p-2 w-auto border";

  tabs.relatorios.innerHTML = `<div class="space-y-6">

    <div class="bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 class="font-bold text-xl text-light-text">Análise de Entradas Diárias por Mês</h4>
        <div class="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
          <div class="flex items-center gap-2">
            <label for="filtroAnoAnaliseDiaria" class="text-sm font-medium text-subtle-text">Ano:</label>
            <select id="filtroAnoAnaliseDiaria" class="${filterSelectClasses}">${anosDesc.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div id="dailyAnalysisTableContainer" class="overflow-x-auto mb-8"></div>
      <h5 class="text-lg font-semibold text-light-text mb-4 mt-8">Total de Ganhos por Dia do Mês</h5>
      <div class="h-96"><canvas id="dailyTotalsChart"></canvas></div>
    </div>

    <div class="bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 class="font-bold text-xl text-light-text">Evolução Mensal</h4>
        <div class="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
          <div class="flex items-center gap-2">
            <label for="filtroAnoInicial" class="text-sm font-medium text-subtle-text">De:</label>
            <select id="filtroAnoInicial" class="${filterSelectClasses}">${anos.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
          <div class="flex items-center gap-2">
            <label for="filtroAnoFinal" class="text-sm font-medium text-subtle-text">Até:</label>
            <select id="filtroAnoFinal" class="${filterSelectClasses}">${anos.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div class="h-96"><canvas id="evolucaoChart"></canvas></div>
    </div>

    <div class="bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 class="font-bold text-xl text-light-text">Recebimentos Diários por Fonte</h4>
        <div class="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
          <div class="flex items-center gap-2">
            <label for="filtroMesRecebimentos" class="text-sm font-medium text-subtle-text">Mês:</label>
            <select id="filtroMesRecebimentos" class="${filterSelectClasses}">${MESES_NOME.map((mes, i) => `<option value="${i}" ${i === mesAtual ? 'selected' : ''}>${mes}</option>`).join('')}</select>
          </div>
          <div class="flex items-center gap-2">
            <label for="filtroAnoRecebimentos" class="text-sm font-medium text-subtle-text">Ano:</label>
            <select id="filtroAnoRecebimentos" class="${filterSelectClasses}">${anosDesc.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div class="h-96"><canvas id="recebimentosDiariosChart"></canvas></div>
    </div>

    <div class="bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 class="font-bold text-xl text-light-text">Comparativo de Entradas Mensais</h4>
        <div class="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
          <div class="flex items-center gap-2">
            <label for="filtroAnoComparativo" class="text-sm font-medium text-subtle-text">Ano:</label>
            <select id="filtroAnoComparativo" class="${filterSelectClasses}">${anosDesc.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div class="h-96"><canvas id="comparativoMensalChart"></canvas></div>
    </div>

    <div class="bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 class="font-bold text-xl text-light-text">Comparativo de Saídas Mensais</h4>
        <div class="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
          <div class="flex items-center gap-2">
            <label for="filtroAnoComparativoSaidas" class="text-sm font-medium text-subtle-text">Ano:</label>
            <select id="filtroAnoComparativoSaidas" class="${filterSelectClasses}">${anosDesc.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div class="h-96"><canvas id="comparativoSaidasMensalChart"></canvas></div>
    </div>

    <div class="bg-card-bg text-primary p-6 rounded-xl shadow-lg border border-border">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h4 class="font-bold text-xl text-light-text">Custos do Negócio (Mensal)</h4>
        <div class="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2">
          <div class="flex items-center gap-2">
            <label for="filtroAnoCustosNegocio" class="text-sm font-medium text-subtle-text">Ano:</label>
            <select id="filtroAnoCustosNegocio" class="${filterSelectClasses}">${anosDesc.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div class="h-96"><canvas id="custosNegocioChart"></canvas></div>
    </div>
  </div>`;

  document.getElementById('filtroAnoInicial').addEventListener('change', renderizarGraficoEvolucao);
  document.getElementById('filtroAnoFinal').addEventListener('change', renderizarGraficoEvolucao);
  document.getElementById('filtroAnoComparativo').addEventListener('change', renderizarGraficoComparativoMensal);
  document.getElementById('filtroAnoComparativoSaidas').addEventListener('change', renderizarGraficoComparativoSaidasMensal);
  document.getElementById('filtroAnoCustosNegocio').addEventListener('change', renderizarGraficoCustosNegocio);
  document.getElementById('filtroAnoAnaliseDiaria').addEventListener('change', renderizarAnaliseDiaria);
  document.getElementById('filtroMesRecebimentos').addEventListener('change', renderizarGraficoRecebimentosDiarios);
  document.getElementById('filtroAnoRecebimentos').addEventListener('change', renderizarGraficoRecebimentosDiarios);

  renderizarAnaliseDiaria();
  renderizarGraficoEvolucao();
  renderizarGraficoRecebimentosDiarios();
  renderizarGraficoComparativoMensal();
  renderizarGraficoComparativoSaidasMensal();
  renderizarGraficoCustosNegocio();
}

function renderizarAnaliseDiaria() {
  destroyChart(analiseDiariaChart);
  const anoEl = document.getElementById('filtroAnoAnaliseDiaria');
  const tableContainer = document.getElementById('dailyAnalysisTableContainer');
  const chartCtx = document.getElementById('dailyTotalsChart')?.getContext('2d');
  if (!anoEl || !tableContainer || !chartCtx) return;

  const ano = parseInt(anoEl.value);
  const monthlyData = Array.from({ length: 12 }, () => Array(31).fill(0));
  const entradasDoAno = entradas.filter(e => new Date(e.data).getUTCFullYear() === ano);
  let hasData = false;

  entradasDoAno.forEach(entrada => {
    hasData = true;
    const date = new Date(entrada.data);
    monthlyData[date.getUTCMonth()][date.getUTCDate() - 1] += entrada.valor;
  });

  if (!hasData) {
    tableContainer.innerHTML = '<p class="text-subtle-text text-center py-8">Nenhuma entrada encontrada para este ano.</p>';
    chartCtx.clearRect(0, 0, chartCtx.canvas.width, chartCtx.canvas.height);
    return;
  }

  const totalsPerDay = Array(31).fill(0);
  let tableHtml = `<table class="w-full text-xs text-center border-separate" style="border-spacing: 2px;">
    <thead><tr class="text-primary/80">
      <th class="p-2 sticky left-0 bg-card-bg z-10 rounded-tl-lg">Mês</th>
      ${Array.from({ length: 31 }, (_, i) => `<th class="p-2 font-normal">${i + 1}</th>`).join('')}
      <th class="p-2 sticky right-0 bg-card-bg z-10 rounded-tr-lg">Total Mês</th>
    </tr></thead><tbody>`;

  for (let month = 0; month < 12; month++) {
    let totalPerMonth = 0;
    let rowHtml = `<tr class="hover:bg-slate-700/30"><th class="p-1 font-semibold text-light-text sticky left-0 bg-card-bg z-10">${MESES_NOME[month].substring(0, 3)}</th>`;
    for (let day = 0; day < 31; day++) {
      const value = monthlyData[month][day];
      totalPerMonth += value;
      totalsPerDay[day] += value;
      rowHtml += `<td class="p-1 ${value > 0 ? 'text-light-text/90' : 'text-subtle-text/50'}">${value > 0 ? formatarDinheiro(value) : '-'}</td>`;
    }
    rowHtml += `<th class="p-1 font-bold text-secondary sticky right-0 bg-card-bg z-10">${formatarDinheiro(totalPerMonth)}</th></tr>`;
    tableHtml += rowHtml;
  }

  const grandTotal = totalsPerDay.reduce((a, b) => a + b, 0);
  tableHtml += `</tbody><tfoot><tr class="font-bold text-primary">
    <th class="p-2 sticky left-0 bg-card-bg z-10 rounded-bl-lg">Total Dia</th>
    ${totalsPerDay.map(t => `<td class="p-2">${formatarDinheiro(t)}</td>`).join('')}
    <th class="p-2 sticky right-0 bg-card-bg z-10 text-secondary rounded-br-lg">${formatarDinheiro(grandTotal)}</th></tr></tfoot></table>`;

  tableContainer.innerHTML = tableHtml;

  analiseDiariaChart = new Chart(chartCtx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 31 }, (_, i) => `Dia ${i + 1}`),
      datasets: [{ label: `Soma total por dia em ${ano}`, data: totalsPerDay, backgroundColor: '#f59e0b', borderRadius: 4 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { display: false }, tooltip: { callbacks: { label: (ctx) => `Total: ${formatarDinheiro(ctx.parsed.y)}` } } },
      scales: { y: { grid: { color: '#334155' }, ticks: { callback: (v) => formatarDinheiro(v) } }, x: { grid: { color: 'transparent' } } },
    },
  });
}

function renderizarGraficoEvolucao() {
  destroyChart(evolucaoChart);
  const anoInicialEl = document.getElementById('filtroAnoInicial');
  const anoFinalEl = document.getElementById('filtroAnoFinal');
  const ctx = document.getElementById('evolucaoChart')?.getContext('2d');
  const drawMessage = (msg) => { if (!ctx) return; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.font = "16px Inter"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center"; ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2); };
  if (!ctx) return;
  if (!anoInicialEl || !anoFinalEl || !anoInicialEl.value || !anoFinalEl.value) { drawMessage("Nenhum dado para exibir."); return; }

  const anoInicial = parseInt(anoInicialEl.value);
  const anoFinal = parseInt(anoFinalEl.value);
  if (anoInicial > anoFinal) { drawMessage("O ano inicial não pode ser maior que o ano final."); return; }

  const labels = [];
  const dataEntradas = [], dataSaidasPagas = [], dataSaidasPrevistas = [], dataSaldo = [];

  for (let ano = anoInicial; ano <= anoFinal; ano++) {
    for (let mes = 0; mes < 12; mes++) {
      labels.push(`${MESES_NOME[mes].substring(0, 3)}/${String(ano).substring(2)}`);
      const inicioMes = new Date(Date.UTC(ano, mes, 1));
      const fimMes = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999));

      const entradasDoMes = entradas.filter(e => { const d = new Date(e.data); return d >= inicioMes && d <= fimMes; });
      const saidasDoMes = saidas.filter(s => { const d = new Date(s.data); return d >= inicioMes && d <= fimMes; });

      const totalEntradas = entradasDoMes.reduce((a, e) => a + e.valor, 0);
      const totalSaidasPagas = saidasDoMes.filter(s => s.status === 'pago').reduce((a, s) => a + s.valor, 0);
      const totalSaidasPrevistas = saidasDoMes.filter(s => s.status === 'em aberto').reduce((a, s) => a + s.valor, 0);

      dataEntradas.push(totalEntradas);
      dataSaidasPagas.push(totalSaidasPagas);
      dataSaidasPrevistas.push(totalSaidasPrevistas);
      dataSaldo.push(totalEntradas - (totalSaidasPagas + totalSaidasPrevistas));
    }
  }

  evolucaoChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Saldo Previsto', type: 'line', data: dataSaldo, borderColor: '#3b82f6', tension: 0.1, fill: false, borderWidth: 3 },
        { label: 'Entradas', data: dataEntradas, backgroundColor: '#22c55e', stack: 'in' },
        { label: 'Saídas (Pagas)', data: dataSaidasPagas, backgroundColor: '#ef4444', stack: 'out' },
        { label: 'Saídas (Previstas)', data: dataSaidasPrevistas, backgroundColor: '#f59e0b', stack: 'out' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { datalabels: { display: false }, legend: { labels: { color: '#e2e8f0' } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatarDinheiro(ctx.parsed.y)}` } } },
      scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { callback: (v) => formatarDinheiro(v) } }, x: { grid: { color: 'transparent' } } },
    },
  });
}

function renderizarGraficoRecebimentosDiarios() {
  destroyChart(recebimentosDiariosChart);
  const mesEl = document.getElementById('filtroMesRecebimentos');
  const anoEl = document.getElementById('filtroAnoRecebimentos');
  const ctx = document.getElementById('recebimentosDiariosChart')?.getContext('2d');
  const drawMessage = (msg) => { if (!ctx) return; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.font = "16px Inter"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center"; ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2); };
  if (!ctx) return;
  if (!mesEl || !anoEl) { drawMessage("Carregando..."); return; }

  const mes = parseInt(mesEl.value);
  const ano = parseInt(anoEl.value);
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const labels = Array.from({ length: diasNoMes }, (_, i) => String(i + 1).padStart(2, '0'));

  const dataPorFonte = {};
  FONTES_VALIDAS.forEach(f => { dataPorFonte[f] = new Array(diasNoMes).fill(0); });

  const inicioMes = new Date(Date.UTC(ano, mes, 1));
  const fimMes = new Date(Date.UTC(ano, mes + 1, 0, 23, 59, 59, 999));
  const entradasDoMes = entradas.filter(e => { const d = new Date(e.data); return d >= inicioMes && d <= fimMes; });

  entradasDoMes.forEach(entrada => {
    const dia = new Date(entrada.data).getUTCDate() - 1;
    if (dataPorFonte[entrada.fonte] && dia >= 0 && dia < diasNoMes) dataPorFonte[entrada.fonte][dia] += entrada.valor;
  });

  const datasets = Object.keys(dataPorFonte).map(fonte => ({ label: fonte, data: dataPorFonte[fonte], backgroundColor: CORES_FONTES[fonte] }));

  recebimentosDiariosChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0' } }, datalabels: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatarDinheiro(ctx.parsed.y)}` } } },
      scales: { x: { stacked: false, grid: { color: 'transparent' } }, y: { stacked: false, grid: { color: '#334155' }, ticks: { callback: (v) => formatarDinheiro(v) } } },
    },
  });
}

function renderizarGraficoComparativoMensal() {
  destroyChart(comparativoMensalChart);
  const anoEl = document.getElementById('filtroAnoComparativo');
  const ctx = document.getElementById('comparativoMensalChart')?.getContext('2d');
  const drawMessage = (msg) => { if (!ctx) return; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.font = "16px Inter"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center"; ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2); };
  if (!ctx) return;
  if (!anoEl || !anoEl.value) { drawMessage("Carregando..."); return; }

  const ano = parseInt(anoEl.value);
  const dataMensais = new Array(12).fill(0);
  entradas.filter(e => new Date(e.data).getUTCFullYear() === ano).forEach(e => { dataMensais[new Date(e.data).getUTCMonth()] += e.valor; });

  comparativoMensalChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: MESES_NOME, datasets: [{ label: `Entradas em ${ano}`, data: dataMensais, backgroundColor: '#22c55e', borderColor: '#16a34a', borderWidth: 1 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v) => v > 0 ? formatarDinheiro(v) : '', color: '#f1f5f9', font: { weight: 'bold' } }, tooltip: { callbacks: { label: (ctx) => `Total: ${formatarDinheiro(ctx.parsed.y)}` } } },
      scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { callback: (v) => formatarDinheiro(v) } }, x: { grid: { color: 'transparent' } } },
    },
  });
}

function renderizarGraficoComparativoSaidasMensal() {
  destroyChart(comparativoSaidasMensalChart);
  const anoEl = document.getElementById('filtroAnoComparativoSaidas');
  const ctx = document.getElementById('comparativoSaidasMensalChart')?.getContext('2d');
  const drawMessage = (msg) => { if (!ctx) return; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.font = "16px Inter"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center"; ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2); };
  if (!ctx) return;
  if (!anoEl || !anoEl.value) { drawMessage("Carregando..."); return; }

  const ano = parseInt(anoEl.value);
  const dataMensais = new Array(12).fill(0);
  saidas.filter(s => new Date(s.data).getUTCFullYear() === ano && s.status === 'pago').forEach(s => { dataMensais[new Date(s.data).getUTCMonth()] += s.valor; });

  comparativoSaidasMensalChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: MESES_NOME, datasets: [{ label: `Saídas (Pagas) em ${ano}`, data: dataMensais, backgroundColor: '#ef4444', borderColor: '#dc2626', borderWidth: 1 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v) => v > 0 ? formatarDinheiro(v) : '', color: '#f1f5f9', font: { weight: 'bold' } }, tooltip: { callbacks: { label: (ctx) => `Total: ${formatarDinheiro(ctx.parsed.y)}` } } },
      scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { callback: (v) => formatarDinheiro(v) } }, x: { grid: { color: 'transparent' } } },
    },
  });
}

function renderizarGraficoCustosNegocio() {
  destroyChart(custosNegocioChart);
  const anoEl = document.getElementById('filtroAnoCustosNegocio');
  const ctx = document.getElementById('custosNegocioChart')?.getContext('2d');
  const drawMessage = (msg) => { if (!ctx) return; ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.font = "16px Inter"; ctx.fillStyle = "#94a3b8"; ctx.textAlign = "center"; ctx.fillText(msg, ctx.canvas.width / 2, ctx.canvas.height / 2); };
  if (!ctx) return;
  if (!anoEl || !anoEl.value) { drawMessage("Carregando..."); return; }

  const ano = parseInt(anoEl.value);
  const dataMensais = new Array(12).fill(0);
  saidas.filter(s => new Date(s.data).getUTCFullYear() === ano && s.isCustoNegocio).forEach(s => { dataMensais[new Date(s.data).getUTCMonth()] += s.valor; });

  custosNegocioChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: MESES_NOME, datasets: [{ label: `Custos do Negócio em ${ano}`, data: dataMensais, backgroundColor: '#A855F7', borderColor: '#9333EA', borderWidth: 1 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', formatter: (v) => v > 0 ? formatarDinheiro(v) : '', color: '#f1f5f9', font: { weight: 'bold' } }, tooltip: { callbacks: { label: (ctx) => `Total: ${formatarDinheiro(ctx.parsed.y)}` } } },
      scales: { y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { callback: (v) => formatarDinheiro(v) } }, x: { grid: { color: 'transparent' } } },
    },
  });
}

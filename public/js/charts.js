let entradasChart, saidasChart, comparativoChart, evolucaoChart;
let recebimentosDiariosChart, comparativoMensalChart, comparativoSaidasMensalChart;
let custosNegocioChart, analiseDiariaChart;

function destroyChart(chart) {
  if (chart) chart.destroy();
}

function renderizarGraficosDashboard(entradasPeriodo, saidasPeriodo) {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.weight = '600';

  const totalEntradas = entradasPeriodo.reduce((acc, e) => acc + e.valor, 0);
  const totalSaidasPagas = saidasPeriodo.filter(s => s.status === 'pago').reduce((acc, s) => acc + s.valor, 0);
  const totalSaidasAberto = saidasPeriodo.filter(s => s.status === 'em aberto').reduce((acc, s) => acc + s.valor, 0);

  const createDoughnut = (ctx, data, colors) => {
    const labels = Object.keys(data);
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: Object.values(data),
          backgroundColor: labels.map(l => colors[l] || '#CCCCCC'),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        plugins: {
          legend: { display: false },
          datalabels: {
            formatter: (v) => v > 0 ? formatarDinheiro(v) : '',
            color: (ctx) => getContrastColor(ctx.dataset.backgroundColor[ctx.dataIndex]),
            font: { weight: 'bold' },
          },
        },
      },
    });
  };

  // Gráfico de Entradas
  destroyChart(entradasChart);
  const ctxEntradas = document.getElementById('entradasChart')?.getContext('2d');
  if (ctxEntradas) {
    const dadosEntradas = {};
    entradasPeriodo.forEach(e => { dadosEntradas[e.fonte] = (dadosEntradas[e.fonte] || 0) + e.valor; });
    entradasChart = createDoughnut(ctxEntradas, dadosEntradas, CORES_FONTES);
  }
  renderizarTabelaResumoEntradas(entradasPeriodo);

  // Gráfico de Saídas
  destroyChart(saidasChart);
  const ctxSaidas = document.getElementById('saidasChart')?.getContext('2d');
  if (ctxSaidas) {
    const dadosSaidas = {};
    saidasPeriodo.forEach(s => { dadosSaidas[s.categoria] = (dadosSaidas[s.categoria] || 0) + s.valor; });
    saidasChart = createDoughnut(ctxSaidas, dadosSaidas, CORES_SAIDAS);
  }
  renderizarTabelaResumoSaidas(saidasPeriodo);

  // Gráfico Comparativo
  destroyChart(comparativoChart);
  const ctxComp = document.getElementById('comparativoChart')?.getContext('2d');
  if (ctxComp) {
    comparativoChart = new Chart(ctxComp, {
      type: 'bar',
      data: {
        labels: ['Movimentações'],
        datasets: [
          { label: 'Entradas', data: [totalEntradas], backgroundColor: '#22c55e' },
          { label: 'Pagos', data: [totalSaidasPagas], backgroundColor: '#ef4444' },
          { label: 'Em Aberto', data: [totalSaidasAberto], backgroundColor: '#f59e0b' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' } },
          x: { grid: { color: 'transparent' } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#e2e8f0' } },
          datalabels: {
            anchor: 'end', align: 'end',
            formatter: (v) => v > 0 ? formatarDinheiro(v) : '',
            color: '#f1f5f9', font: { weight: 'bold' }, offset: -5,
          },
        },
      },
    });
  }
}

function renderizarTabelaResumoEntradas(entradasPeriodo) {
  const container = document.getElementById('entradasSummaryTable');
  if (!container) return;

  const dados = {};
  let total = 0;
  entradasPeriodo.forEach(e => { dados[e.fonte] = (dados[e.fonte] || 0) + e.valor; total += e.valor; });

  if (total === 0) {
    container.innerHTML = '<p class="text-subtle-text text-center text-sm py-2">Nenhuma entrada no período.</p>';
    return;
  }

  const sorted = Object.entries(dados).sort(([, a], [, b]) => b - a);
  container.innerHTML = `<ul class="space-y-2 text-sm">${sorted.map(([fonte, valor]) => {
    const pct = (valor / total * 100).toFixed(1);
    return `<li class="flex justify-between items-center">
      <span class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" style="background:${CORES_FONTES[fonte] || '#6B7280'}"></span>
        <span>${fonte}</span>
      </span>
      <span class="font-semibold text-light-text">${formatarDinheiro(valor)} <span class="text-xs text-subtle-text ml-1">(${pct}%)</span></span>
    </li>`;
  }).join('')}</ul>`;
}

function renderizarTabelaResumoSaidas(saidasPeriodo) {
  const container = document.getElementById('saidasSummaryTable');
  if (!container) return;

  const dados = {};
  let total = 0;
  saidasPeriodo.forEach(s => { dados[s.categoria] = (dados[s.categoria] || 0) + s.valor; total += s.valor; });

  if (total === 0) {
    container.innerHTML = '<p class="text-subtle-text text-center text-sm py-2">Nenhuma saída no período.</p>';
    return;
  }

  const sorted = Object.entries(dados).sort(([, a], [, b]) => b - a);
  container.innerHTML = `<ul class="space-y-2 text-sm">${sorted.map(([categoria, valor]) => {
    const pct = (valor / total * 100).toFixed(1);
    return `<li class="flex justify-between items-center">
      <span class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" style="background:${CORES_SAIDAS[categoria] || '#A855F7'}"></span>
        <span>${categoria}</span>
      </span>
      <span class="font-semibold text-light-text">${formatarDinheiro(valor)} <span class="text-xs text-subtle-text ml-1">(${pct}%)</span></span>
    </li>`;
  }).join('')}</ul>`;
}

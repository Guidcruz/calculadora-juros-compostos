let graficoInstance = null;
let lingua = 'pt';
let moeda = 'BRL';

const i18n = {
  pt: {
    pageTitle: 'Calculadora de Juros Compostos',
    titulo: 'Juros Compostos',
    subtitulo: 'Simule o crescimento do seu investimento',
    labelPrincipal: 'Capital inicial',
    labelAporte: 'Aporte mensal',
    labelTaxa: 'Taxa de juros (%)',
    labelPeriodo: 'Período',
    optMensalTaxa: 'Mensal', optAnualTaxa: 'Anual',
    optMeses: 'Meses', optAnos: 'Anos',
    btnCalcular: 'Calcular',
    labelMontante: 'Montante final',
    labelInvestido: 'Total investido',
    labelJuros: 'Juros ganhos',
    thPeriodo: 'Período', thSaldo: 'Saldo',
    thInvestido: 'Total investido', thJuros: 'Juros acumulados',
    mes: 'mês', meses: 'meses',
    errTaxaPeriodo: 'Preencha taxa e período com valores válidos.',
    errCapital: 'Informe ao menos um capital inicial ou aporte mensal.',
    placeholder: '0,00', prefixo: 'R$',
    locale: 'pt-BR', currency: 'BRL',
  },
  en: {
    pageTitle: 'Compound Interest Calculator',
    titulo: 'Compound Interest',
    subtitulo: 'Simulate the growth of your investment',
    labelPrincipal: 'Initial capital',
    labelAporte: 'Monthly deposit',
    labelTaxa: 'Interest rate (%)',
    labelPeriodo: 'Period',
    optMensalTaxa: 'Monthly', optAnualTaxa: 'Annual',
    optMeses: 'Months', optAnos: 'Years',
    btnCalcular: 'Calculate',
    labelMontante: 'Final amount',
    labelInvestido: 'Total invested',
    labelJuros: 'Interest earned',
    thPeriodo: 'Period', thSaldo: 'Balance',
    thInvestido: 'Total invested', thJuros: 'Accumulated interest',
    mes: 'month', meses: 'months',
    errTaxaPeriodo: 'Please enter valid tax and period values.',
    errCapital: 'Enter at least an initial capital or monthly deposit.',
    placeholder: '0.00', prefixo: '$',
    locale: 'en-US', currency: 'USD',
  },
};

function t() { return i18n[lingua]; }

// ─── Moeda ───────────────────────────────────────────────────────────────────

function fmt(valor) {
  return valor.toLocaleString(t().locale, { style: 'currency', currency: t().currency });
}

function fmtInput(valor) {
  if (!valor && valor !== 0) return '';
  return valor.toLocaleString(t().locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseValor(str) {
  if (!str) return 0;
  str = str.replace(/[R$\s]/g, '');
  if (lingua === 'pt') {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  } else {
    return parseFloat(str.replace(/,/g, '')) || 0;
  }
}

function onFocusValor(input) {
  const val = parseValor(input.value);
  input.value = val > 0 ? val : '';
  input.select();
}

function onBlurValor(input) {
  const val = parseValor(input.value);
  input.value = val > 0 ? fmtInput(val) : '';
}

// ─── Idioma ──────────────────────────────────────────────────────────────────

function toggleLingua() {
  lingua = lingua === 'pt' ? 'en' : 'pt';
  moeda = lingua === 'pt' ? 'BRL' : 'USD';
  aplicarLingua();
}

function aplicarLingua() {
  const l = t();
  document.documentElement.lang = lingua === 'pt' ? 'pt-BR' : 'en';
  document.getElementById('page-title').textContent = l.pageTitle;
  document.getElementById('titulo').textContent = l.titulo;
  document.getElementById('subtitulo').textContent = l.subtitulo;
  document.getElementById('label-principal').textContent = l.labelPrincipal;
  document.getElementById('label-aporte').textContent = l.labelAporte;
  document.getElementById('label-taxa').textContent = l.labelTaxa;
  document.getElementById('label-periodo').textContent = l.labelPeriodo;
  document.getElementById('opt-mensal-taxa').textContent = l.optMensalTaxa;
  document.getElementById('opt-anual-taxa').textContent = l.optAnualTaxa;
  document.getElementById('opt-meses').textContent = l.optMeses;
  document.getElementById('opt-anos').textContent = l.optAnos;
  document.getElementById('btn-calcular').textContent = l.btnCalcular;
  document.getElementById('label-montante').textContent = l.labelMontante;
  document.getElementById('label-investido').textContent = l.labelInvestido;
  document.getElementById('label-juros').textContent = l.labelJuros;
  document.getElementById('th-periodo').textContent = l.thPeriodo;
  document.getElementById('th-saldo').textContent = l.thSaldo;
  document.getElementById('th-investido').textContent = l.thInvestido;
  document.getElementById('th-juros').textContent = l.thJuros;
  document.getElementById('btn-lingua').textContent = lingua === 'pt' ? 'PT • R$' : 'EN • $';
  document.getElementById('prefix-principal').textContent = l.prefixo;
  document.getElementById('prefix-aporte').textContent = l.prefixo;

  // Limpa inputs e esconde resultado ao trocar idioma
  ['principal', 'aporte'].forEach(id => {
    const input = document.getElementById(id);
    input.value = '';
    input.placeholder = l.placeholder;
  });

  document.getElementById('taxa').value = '';
  document.getElementById('periodo').value = '';

  document.getElementById('resultado').style.display = 'none';
}

// ─── Tema ────────────────────────────────────────────────────────────────────

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('icon-moon').style.display = isDark ? 'block' : 'none';
  document.getElementById('icon-sun').style.display  = isDark ? 'none'  : 'block';
  if (graficoInstance) renderGrafico(graficoInstance._data);
}

// ─── Cálculo ─────────────────────────────────────────────────────────────────

function calcular() {
  const principal = parseValor(document.getElementById('principal').value);
  const taxaInput = parseFloat(document.getElementById('taxa').value) || 0;
  const periodoInput = parseInt(document.getElementById('periodo').value) || 0;
  const unidade = document.getElementById('unidade').value;
  const aporte = parseValor(document.getElementById('aporte').value);

  if (taxaInput <= 0 || periodoInput <= 0) {
    alert(t().errTaxaPeriodo);
    return;
  }

  if (principal === 0 && aporte === 0) {
    alert(t().errCapital);
    return;
  }

  const tipoTaxa = document.getElementById('tipo-taxa').value;
  const taxaMensal = tipoTaxa === 'mensal'
    ? taxaInput / 100
    : Math.pow(1 + taxaInput / 100, 1 / 12) - 1;
  const meses = unidade === 'mensal' ? periodoInput : periodoInput * 12;

  const linhas = [];
  const chartLabels = [];
  const chartSaldo = [];
  const chartInvestido = [];

  let saldo = principal;
  let totalInvestido = principal;
  const intervalo = meses <= 24 ? 1 : meses <= 60 ? 3 : 12;

  for (let i = 1; i <= meses; i++) {
    saldo = saldo * (1 + taxaMensal) + aporte;
    totalInvestido += aporte;

    if (i % intervalo === 0 || i === meses) {
      linhas.push({ periodo: i, saldo, totalInvestido, jurosAcumulados: saldo - totalInvestido });
      chartLabels.push(`${i}m`);
      chartSaldo.push(parseFloat(saldo.toFixed(2)));
      chartInvestido.push(parseFloat(totalInvestido.toFixed(2)));
    }
  }

  const jurosGanhos = saldo - totalInvestido;
  document.getElementById('montante').textContent = fmt(saldo);
  document.getElementById('investido').textContent = fmt(totalInvestido);
  document.getElementById('juros').textContent = fmt(jurosGanhos);

  const tbody = document.getElementById('tabela-body');
  tbody.innerHTML = '';
  linhas.forEach(({ periodo, saldo, totalInvestido, jurosAcumulados }) => {
    const tr = document.createElement('tr');
    const label = periodo === 1 ? t().mes : t().meses;
    tr.innerHTML = `
      <td>${periodo} ${label}</td>
      <td>${fmt(saldo)}</td>
      <td>${fmt(totalInvestido)}</td>
      <td>${fmt(jurosAcumulados)}</td>
    `;
    tbody.appendChild(tr);
  });

  const chartData = { labels: chartLabels, saldo: chartSaldo, investido: chartInvestido };
  renderGrafico(chartData);

  const resultado = document.getElementById('resultado');
  resultado.style.display = 'flex';
  resultado.scrollIntoView({ behavior: 'smooth' });
}

// ─── Gráfico ─────────────────────────────────────────────────────────────────

function renderGrafico(data) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const accentColor = isDark ? '#818cf8' : '#4f46e5';
  const greenColor = isDark ? '#34d399' : '#10b981';

  const crosshairPlugin = {
    id: 'crosshair',
    afterDraw(chart) {
      if (chart._crosshairX == null) return;
      const { ctx, chartArea: { top, bottom } } = chart;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(chart._crosshairX, top);
      ctx.lineTo(chart._crosshairX, bottom);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    },
  };

  const ctx = document.getElementById('grafico').getContext('2d');
  if (graficoInstance) graficoInstance.destroy();

  graficoInstance = new Chart(ctx, {
    type: 'line',
    plugins: [crosshairPlugin],
    data: {
      labels: data.labels,
      datasets: [
        {
          label: t().labelMontante,
          data: data.saldo,
          borderColor: accentColor,
          backgroundColor: accentColor + '22',
          fill: true,
          tension: 0.4,
          pointRadius: data.labels.length > 30 ? 0 : 3,
          borderWidth: 2,
        },
        {
          label: t().labelInvestido,
          data: data.investido,
          borderColor: greenColor,
          backgroundColor: greenColor + '18',
          fill: true,
          tension: 0.4,
          pointRadius: data.labels.length > 30 ? 0 : 3,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      onHover(event, _, chart) {
        const points = chart.getElementsAtEventForMode(event.native, 'index', { intersect: false }, true);
        chart._crosshairX = points.length ? points[0].element.x : null;
        chart.draw();
      },
      plugins: {
        legend: {
          labels: { color: textColor, font: { size: 12 }, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor, maxTicksLimit: 10 },
          grid: { color: gridColor },
        },
        y: {
          ticks: {
            color: textColor,
            callback: (v) => {
              if (v >= 1000000) return (moeda === 'BRL' ? 'R$ ' : '$ ') + (v / 1000000).toFixed(1) + 'M';
              if (v >= 1000) return (moeda === 'BRL' ? 'R$ ' : '$ ') + (v / 1000).toFixed(0) + 'k';
              return (moeda === 'BRL' ? 'R$ ' : '$ ') + v;
            },
          },
          grid: { color: gridColor },
        },
      },
    },
  });

  graficoInstance._data = data;

  document.getElementById('grafico').addEventListener('mouseleave', () => {
    graficoInstance._crosshairX = null;
    graficoInstance.draw();
  });
}

// ─── Init ────────────────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') calcular();
});

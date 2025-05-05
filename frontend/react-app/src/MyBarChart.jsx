import { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';

// Dados principais por país
const dadosPorPais = [
  { country: 'Brasil', vendas: 120 },
  { country: 'Argentina', vendas: 80 },
  { country: 'Chile', vendas: 100 },
];

// Dados falsos por país e região
const dadosRegioes = {
  Brasil: [
    { regiao: 'Sul', vendas: 40 },
    { regiao: 'Sudeste', vendas: 50 },
    { regiao: 'Nordeste', vendas: 30 },
    { regiao: 'Norte', vendas: 20 },
    { regiao: 'Centro-Oeste', vendas: 25 },
  ],
  Argentina: [
    { regiao: 'Buenos Aires', vendas: 30 },
    { regiao: 'Córdoba', vendas: 20 },
    { regiao: 'Santa Fe', vendas: 15 },
    { regiao: 'Mendoza', vendas: 10 },
    { regiao: 'Patagônia', vendas: 5 },
  ],
  Chile: [
    { regiao: 'Norte Grande', vendas: 20 },
    { regiao: 'Norte Chico', vendas: 15 },
    { regiao: 'Zona Central', vendas: 30 },
    { regiao: 'Zona Sul', vendas: 25 },
    { regiao: 'Zona Austral', vendas: 10 },
  ]
};

// Mapeamento manual de bandeiras
const bandeiras = {
  Brasil: 'br',
  Argentina: 'ar',
  Chile: 'cl',
};

// Estilo compartilhado para ambos os gráficos
const estiloGrafico = {
  margin: { top: 30, right: 20, bottom: 50, left: 40 },
  padding: 0.4,
  colors: '#9ca3af',
  enableGridX: true,
  enableGridY: true,
  gridXValues: 3,
  gridYValues: 5,
  theme: {
    grid: {
      line: {
        stroke: 'rgba(220, 38, 38, 0.15)',
        strokeWidth: 1,
      },
    },
    textColor: '#e5e7eb',
    axis: {
      ticks: {
        text: {
          fill: '#e5e7eb',
          fontSize: 14,
        },
      },
    },
    tooltip: {
      container: {
        background: '#1f2f37',
        color: '#fff',
        fontSize: 12,
        borderRadius: '6px',
        padding: '6px 10px',
      },
    },
  },
  axisBottom: {
    tickSize: 0,
    tickPadding: 10,
    tickRotation: 0,
    legend: '',
    legendPosition: 'middle',
    legendOffset: 32,
  },
  axisLeft: null,
  labelSkipWidth: 999,
  labelSkipHeight: 999,
  borderRadius: 12,
};

const ChartPorRegiao = ({ pais, onVoltar }) => (
  <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">{pais} por Região</h2>
      <button
        className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md"
        onClick={onVoltar}
      >
        Voltar
      </button>
    </div>
    <div className="h-[400px]">
      <ResponsiveBar
        data={dadosRegioes[pais] || []}
        keys={['vendas']}
        indexBy="regiao"
        {...estiloGrafico}
        tooltip={({ data }) => (
          <div style={{ padding: '6px 10px', background: '#111827', borderRadius: '8px', color: '#fff' }}>
            {data.regiao}: {data.vendas}
          </div>
        )}
      />
    </div>
  </div>
);

const MyBarChart = () => {
  const [paisSelecionado, setPaisSelecionado] = useState(null);

  if (paisSelecionado) {
    return <ChartPorRegiao pais={paisSelecionado} onVoltar={() => setPaisSelecionado(null)} />;
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
      <h2 className="text-lg font-semibold mb-4">Relatório de Vendas por País</h2>
      <div className="h-[400px]">
        <ResponsiveBar
          data={dadosPorPais}
          keys={['vendas']}
          indexBy="country"
          {...estiloGrafico}
          axisBottom={{
            ...estiloGrafico.axisBottom,
            tickValues: dadosPorPais.map(item => item.country),
            tickColor: '#ffffff',
          }}
          onClick={({ data }) => setPaisSelecionado(data.country)}
          tooltip={({ data }) => {
            const codigo = bandeiras[data.country] || 'xx';
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#424242',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '18px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${codigo}.png`}
                  alt={`Bandeira de ${data.country}`}
                  style={{ width: 24, height: 16, borderRadius: 2 }}
                />
                <div>
                  <strong>{data.country}</strong>: {data.vendas}
                </div>
              </div>
            );
          }}
          role="application"
          barAriaLabel={e => `${e.id}: ${e.formattedValue} em ${e.indexValue}`}
          tooltipLabel={e => e.data.country}
        />
      </div>
    </div>
  );
};

export default MyBarChart;

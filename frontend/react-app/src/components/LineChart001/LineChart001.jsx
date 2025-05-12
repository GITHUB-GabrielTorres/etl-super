import { ResponsiveLine } from '@nivo/line'
import React, { useEffect, useState } from 'react'
import { GetLigacoesPorDia } from '../../services/api'
import { formatDate } from '../../utils/formatter'
import { line as d3Line, curveMonotoneX } from 'd3-shape'


// Tooltip customizada
const CustomTooltip = ({ point }) => (
  <div className='bg-linear-125 from-[#003b3966] to-[#003b3999] backdrop-blur-[1px] p-1.5 rounded border-1 border-white flex flex-col items-center'>
    <strong className='text-sm text-white'>{formatDate(point.data.xFormatted)}</strong>
    <strong className='text-sm text-white'>Valor: <span style={{ color: point.serieColor }}>{point.data.yFormatted}</span></strong>
  </div>
)

export default function LineChart001({ inicio, fim, chamadores }) {
  const [dados, setDados] = useState([])

  const obterSegundasFeiras = (dataArray) => {
    const diasUnicos = [...new Set(dataArray.map(item => item.x))]
    return diasUnicos.filter(dateStr => {
      const date = new Date(dateStr)
      return date.getDay() in [0] // 0 = Segunda
    })
  }

  const buscarDados = () => {
    if (!inicio) return;

    const query_params = {
      chamadores: chamadores,
      data_inicio: inicio,
      data_fim: fim
    }

    GetLigacoesPorDia(query_params)
      .then((resposta) => {
        const convertido = resposta.map(item => ({
          x: item.dia ?? 'Indefinido',
          y: Number(item.quantidade ?? 0)
        }))
        setDados(convertido)
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error)
        setDados([])
      })
  }

  useEffect(() => {
    buscarDados()
    const intervalo = setInterval(buscarDados, 55000)
    return () => clearInterval(intervalo)
  }, [inicio, fim, chamadores])

  const data = [
    {
      id: "Quantidade",
      data: dados
    }
  ]

  const markers = obterSegundasFeiras(dados).map(data => ({
    axis: 'x',
    value: data,
    lineStyle: {
      stroke: '#54545411',
      strokeWidth: 70
    }
  }))
// Linha 90
const GradientLineLayer = ({ series, xScale, yScale }) => {
  const lineGenerator = d3Line()
    .x(d => xScale(d.data.x))
    .y(d => yScale(d.data.y))
    .curve(curveMonotoneX)

  return (
    <g>
      <defs>
        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000e25" />
          <stop offset="40%" stopColor="#00b2ad77" />
          <stop offset="95%" stopColor="#00b2ad11" />
        </linearGradient>
      </defs>
      {series.map(({ data }, i) => (
        <path
          key={i}
          d={lineGenerator(data)}
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth={3}
        />
      ))}
    </g>
  )
}

  return (
    
    <div className="h-full w-full">
      {dados.length > 0 ? (
        <ResponsiveLine
          data={data}
          layers={[
            'grid',
            'axes',
            GradientLineLayer, // Linha 134 — aqui o layer customizado substitui a linha padrão
            'points',
            'markers',
            'mesh',
            'legends',
          ]}
          margin={{ top: 7, right: 7, bottom: 100, left: 45 }}
          curve="monotoneX"
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear' }}
          markers={markers}
          enableArea={true}
          areaOpacity={0.1}
          enablePointLabel={true}        
          axisBottom={{
            tickRotation: -35,
            format: value => formatDate(value),
            legendOffset: 100,
            legend: '',
            tickPadding: 10,
            tickSize: 0,
          }}
          axisLeft={{
            tickPadding: 20,
            tickSize: 0,
          }}
          colors={{ scheme: 'nivo' }}
          pointSize={0} 
          enableGridX={false}
          enableGridY={false}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh={true}
          tooltip={({ point }) => <CustomTooltip point={point} />}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: '#000e2588',
                  fontSize: 12
                }
              }
            },
            textColor: '#1f2937',
            grid: {
              line: {
                stroke: '#d9d9d9',
                strokeWidth: 1
              }
            }
          }}
        />
      ) : (
        <p className="text-center text-gray-500">Carregando ou sem dados disponíveis.</p>
      )}
    </div>
  )
}
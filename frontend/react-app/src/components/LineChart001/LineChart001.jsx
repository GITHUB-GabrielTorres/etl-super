import { ResponsiveLine } from '@nivo/line'
import React, { useEffect, useState } from 'react'
import { GetLigacoesPorDia } from '../../services/api'

// Tooltip customizada
const CustomTooltip = ({ point }) => (
  <div
    style={{
      background: '#111827',
      color: '#ffffff',
      padding: '10px',
      borderRadius: '6px',
      fontSize: '14px',
      boxShadow: '0 0 6px rgba(0,0,0,0.3)'
    }}
  >
    <strong>{point.data.xFormatted}</strong><br />
    Valor: <span style={{ color: point.serieColor }}>{point.data.yFormatted}</span>
  </div>
)

export default function LineChart001({ inicio, fim, chamadores }) {
  const [dados, setDados] = useState([])

  const obterSegundasFeiras = (dataArray) => {
    const diasUnicos = [...new Set(dataArray.map(item => item.x))]
    return diasUnicos.filter(dateStr => {
      const date = new Date(dateStr)
      return date.getDay() === 0 // 0 = Domingo
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
    const intervalo = setInterval(buscarDados, 5000)
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
      stroke: '#000e2533',
      strokeWidth: 3
    }
  }))

  return (
    <div className="h-full w-full">
      {dados.length > 0 ? (
        <ResponsiveLine
          data={data}
          margin={{ top: 7, right: 7, bottom: 50, left: 45 }}
          curve="monotoneX"
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear' }}
          markers={markers}
          enableArea={true}
          areaOpacity={0.1}
          enablePointLabel={true}        
          axisBottom={{
            tickRotation: -25,
          }}
          colors={['#000e2588', '#60a5fa', '#34d399']}
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
                  fontSize: 13
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

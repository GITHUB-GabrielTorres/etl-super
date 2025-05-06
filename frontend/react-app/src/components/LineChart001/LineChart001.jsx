import { ResponsiveLine } from '@nivo/line'
import React, { useEffect, useState } from 'react'
import { GetLigacoesPorDia } from '../../services/api'

export default function LineChart001({ inicio, fim, chamadores }) {
  const [dados, setDados] = useState([])

  useEffect(() => {
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
  }, [inicio, fim, chamadores])

  const data = [
    {
      id: "Quantidade",
      data: dados
    }
  ]

  return (
    <div className="h-full w-full">
      {dados.length > 0 ? (
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 10, bottom: 50, left: 45 }}
          curve="monotoneX"
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear' }}
          markers={[
            { axis: 'x', value: '2025-05-05', lineStyle: { stroke: '#00fff844', strokeWidth: 2 } },
            { axis: 'x', value: '2025-05-12', lineStyle: { stroke: '#00fff844', strokeWidth: 2 } },
            // adicione quantas segundas quiser
          ]}
          axisBottom={{
            tickRotation: -25,
            legendPosition: 'middle'
          }}
          colors={['#fff', '#60a5fa', '#34d399']}
          pointSize={6}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          useMesh={true}
          theme={{
            axis:{
              ticks:{
                text:{
                  fill: '#ddd',
                  fontSize: 15
                }
              }
            },
            textColor: '#1f2937',
            grid: {
              line: {
                stroke: '#fff2',
                strokeWidth: 1
              }
            },
            tooltip: {
              container: {
                background: '#f9fafb20',
                color: '#ddd',
                fontSize: 16,
                borderRadius: '6px',
                padding: '8px 12px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
              }
            },
            
          }
        }
        />
      ) : (
        <p className="text-center text-gray-500">Carregando ou sem dados disponíveis.</p>
      )}
    </div>
  )
}

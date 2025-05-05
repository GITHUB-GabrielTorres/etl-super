import { ResponsiveLine } from '@nivo/line'
import React, { useEffect, useState } from 'react'

import { GetLigacoesPorDia } from '../../services/api'

export default function LineChart001({ inicio, fim }) {
  const [dados, setDados] = useState([])

  useEffect(() => {
    if (!inicio || !fim) return; // evita chamadas sem datas definidas

    GetLigacoesPorDia(inicio, fim).then((resposta) => {
      const convertido = resposta.map(item => ({
        x: item.dia,
        y: item.quantidade
      }))
      setDados(convertido)
    }).catch((error) => {
      console.error('Erro ao buscar dados:', error)
      setDados([]) // limpa dados em caso de erro
    })
  }, [inicio, fim]) // <- agora ele atualiza quando as props mudam

  const data = [
    {
      id: "Quantidade",
      data: dados
    }
  ]

  return (
    <div className="h-full w-full">
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 10, bottom: 50, left: 45 }}
        curve="monotoneX"
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear' }}
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
              color: '#444',
              fontSize: 16,
              borderRadius: '6px',
              padding: '8px 12px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
            }
          }
        }}
      />
    </div>
  )
}

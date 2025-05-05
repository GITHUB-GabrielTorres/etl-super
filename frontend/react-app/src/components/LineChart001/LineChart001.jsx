import { ResponsiveLine } from '@nivo/line'
import React, { useEffect, useState } from 'react'

import { GetLigacoesPorDia } from '../../services/api'

export default function LineChart001() {

  const [dados, setDados] = useState([]);

  useEffect(() => {
    GetLigacoesPorDia().then((resposta) => {
      setDados(resposta)
      console.log('e: ' + resposta)
    })
  }, [])

  const data = [
    {
      id: "Quantidade",
      data: dados
    }
  ];

  return (
    <div className="h-[400px] bg-white p-4 rounded-xl text-black w-250 shadow-md">
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 30, bottom: 50, left: 40 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        axisBottom={{
          tickRotation: -20,
          legend: 'Data',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          legend: 'Quantidade',
          legendOffset: -30,
          legendPosition: 'middle'
        }}
        colors={{ scheme: 'category10' }}
        pointSize={8}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        useMesh={true}
        theme={{
          textColor: '#1f2937', // gray-800
          tooltip: {
            container: {
              background: '#f9fafb',
              color: '#111827',
              fontSize: 12,
              borderRadius: '6px',
              padding: '6px 10px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
            }
          }
        }}
      />
    </div>
  );
}

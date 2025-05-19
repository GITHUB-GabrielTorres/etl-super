import { ResponsiveLine } from "@nivo/line";
import React, { useEffect, useState } from "react";
import { GetLigacoes } from "../../services/api";


export default function LineChart001({ filtros }) {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    // Fez uma função que é executada dentro do useEffect
    // Isso é necessário para que o useEffect possa ser assíncrono
    async function buscarDados() {
      const resposta = await GetLigacoes({
        dias: [1, 2, 3, 4, 5, 6],
        chamadores: ["Suelen Lidoni, Aline Moreira, Gabriel Torres"],
        modo_y: "ligacoes_totais",
        periodo_media_movel: 2,
        tipo_periodo: "dia",
        agrupamento_por_chamador: true,
        inicio: "2025-04-15",
        fim: "2025-05-10",
      });

      // 1. Collect all unique dates
      const allDatesSet = new Set();
      resposta.forEach(item => {
        allDatesSet.add(item.periodo);
      });
      const allDates = Array.from(allDatesSet).sort(); // sorted array of dates

      // 2. Group data by collaborator
      const resposta_formatada = {};
      resposta.forEach(item => {
        if (!resposta_formatada[item.colaborador]) {
          resposta_formatada[item.colaborador] = {};
        }
        resposta_formatada[item.colaborador][item.periodo] = Number(item.quantidade) || 0;
      });

      // 3. For each collaborator, create a data array with all dates (fill missing with 0)
      const dadosFormatados = Object.entries(resposta_formatada).map(
        ([colaborador, dataObj]) => ({
          id: colaborador,
          data: allDates.map(date => ({
            x: date,
            y: dataObj[date] !== undefined ? dataObj[date] : 0,
          })),
        })
      );

      setDados(dadosFormatados);
    }

    buscarDados();
  }, []);

  return (
    <div className="h-full w-full">
      {dados.length > 0 ? (
        <ResponsiveLine
          data={dados}
          margin={{ top: 7, right: 7, bottom: 100, left: 45 }}
          curve="monotoneX"
          xScale={{ type: "point" }}
          yScale={{ type: "linear" }}
          enableArea={true}
          areaOpacity={0.1}
          axisBottom={{
            tickRotation: -35,
            legendOffset: 100,
            tickPadding: 10,
            tickSize: 0,
          }}
          axisLeft={{
            tickPadding: 20,
            tickSize: 0,
          }}
          pointSize={6}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          enableGridX={false}
          enableGridY={false}
          useMesh={true}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: "#000e2588",
                  fontSize: 12,
                },
              },
            },
            textColor: "#1f2937",
            grid: {
              line: {
                stroke: "#d9d9d9",
                strokeWidth: 1,
              },
            },
          }}
        />
      ) : (
        <p className="text-center text-gray-500">
          Carregando ou sem dados disponíveis.
        </p>
      )}
    </div>
  );
}

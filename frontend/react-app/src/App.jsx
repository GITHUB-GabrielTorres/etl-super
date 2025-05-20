  import { useState } from 'react'
  import { useEffect } from 'react'

  import './styles/App.css'
  import {stringify, v4 as uuidv4} from 'uuid'
  import { FaPhone } from "react-icons/fa6"
  import { FaBullseye } from "react-icons/fa6"
  import LineChart001 from './components/LineChart001/LineChart001'
  import ListOptions001 from './components/ListOptions001/ListOptions001'
  import Table001 from './components/Table001/Table001'
  import MultiSelectDropdown from './components/MultiSelectDropdown/MultiSelectDropdown'
  import { GetColaboradores, GetLigacoes } from './services/api'
  import { ResponsiveLine } from "@nivo/line";

  import { formatDate } from './utils/formatter'

  function App() {
    // Data linechart
    const [ligacoes, setLigacoes] = useState(null)
    // Linechart variables
    const [dias, setDias] = useState([0,1,2,3,4,5,6])
    const [colaboradores, setColaboradores] = useState(null)
    const [modoY, setModoY] = useState(null)
    const [periodoMediaMovel, setPeriodoMediaMovel] = useState(null)
    const [tipoPeriodo, setTipoPeriodo] = useState(null)
    const [agrupadoPorChamador, setAgrupadoPorChamador] = useState(null)
    const [dataInicio, setDataInicio] = useState(null)
    const [dataFim, setDataFim] = useState(null)
    
    // useEffect para abertura da página
    useEffect(() => {
      // ? Função para pegar os colaboradores
      async function GetColaboradoresApp(){
        try{
            const resposta = await GetColaboradores()
            setColaboradores(resposta)
          } catch(erro){
          console.log('Erro ao buscar os dados:', erro.message);
        }
      }
      GetColaboradoresApp()

      // ? Função para pegar dados de ligação
      async function PegaLigacoes(){
        try{
          const response = await GetLigacoes({
            dias: [2, 3, 4, 5, 6],
            chamadores: ['Suelen Lidoni', 'Aline Moreira', 'Gabriel Torres'],
            modo_y: 'media_movel',
            periodo_media_movel: 10,
            tipo_periodo: 'dia',
            agrupamento_por_chamador: 1,
            inicio: '2025-04-11',
            fim: '2025-05-20'
          })
          const comUID = response.map(item => ({ // Responsável por inserir o uid
            ...item, _uid: uuidv4()
          }))
          // Caso não tenha colaborador. Significa que o agrupamento é por data. Portanto apenas x e y simples.
          let dados_tratados = []
          if (response.length && !response[0].colaborador){
            dados_tratados = response.map(item => ({
              x: item.periodo,
              y: (item.quantidade ?? item.media_movel.toFixed(1)) // Ou item.quantidade ou item.media_movel. Fica o que estiver preenchimento.
            }))
            setLigacoes([{id: 'Ligacoes', data: dados_tratados}]) // Insere os dados com o ID
          } else {
            // 1. Extrai todas as datas únicas presentes no conjunto (de todos os colaboradores)
            const todasDatas = Array.from(new Set(response.map(item => item.periodo)))
              .sort((a, b) => new Date(a) - new Date(b)) // ordena cronologicamente

            // 2. Organiza os dados por colaborador como um mapa de data → valor
            const resposta_formatada = {}
            response.forEach(item => {
              if (!resposta_formatada[item.colaborador]) {
                resposta_formatada[item.colaborador] = {}
              }
              resposta_formatada[item.colaborador][item.periodo] =
                (item.quantidade ?? item.media_movel).toFixed(1)
            })

            // 3. Para cada colaborador, cria uma série com todas as datas
            const resposta_final = Object.entries(resposta_formatada).map(([colaborador, dataMap]) => {
              const data = todasDatas.map(data => ({
                x: data,
                y: dataMap[data] !== undefined ? dataMap[data] : null // ou null se quiser "buracos"
              }))
              return { id: colaborador, data }
            })

            setLigacoes(resposta_final)
          }

          // console.log(`Dados: ${JSON.stringify(dados_tratados)}`)
        } catch(error){
          console.log(`O erro: ${error}`)
        }
      }
      PegaLigacoes()
    }, [])

    const toggleDiaDaSemana = (dia) =>{
      if (dias.includes(dia)){
        setDias(dias.filter(d => d !== dia));
      } else {
        setDias([...dias, dia])
      }
    }

    // Criação do Tooltip personalizado
    const Tooltip1 = ({point}) => (
      <div className='bg-[#00000081] backdrop-blur-[5px] p-2 border-1 border-white shadow-xl rounded-xl text-white mb-5 whitespace-nowrap'>
        <h3 className='font-bold text-xl'>{point.seriesId}</h3>
        <p className='whitespace-nowrap'>{`Data: ${point.data.xFormatted}`}</p>
        <p className='whitespace-nowrap'>{`Quantidade: ${point.data.yFormatted}`}</p>
      </div>
    )

    
    return (
      <div className='min-h-screen h-full w-full bg-[#f1f1f7] flex'>
        <div className="sideBar w-[clamp(200px,19vw,400px)] border-r-1 border-[#C9C9C9]  grid grid-cols-1 grid-rows-[auto_auto_1fr_auto]">
          <div className="logo px-10 py-8">
            <img src="https://syngoo.com.br/wp-content/uploads/2022/09/syngoo4.png" alt="" />
          </div>
          <div className="userProfileArea p-3 flex justify-center">
            <div className='userProfileContainer flex py-3 justify-center w-[90%] rounded-xl bg-[#f8f8ff] border-[#DBDBDB] border-2'>
              <div className="profilePicture size-22 rounded-2xl">
                <img className='w-full h-full object-cover rounded-2xl' src="https://avatars.githubusercontent.com/u/128627372?v=4" alt="" />
              </div>
              <div className="name flex flex-col justify-center ml-3">
                <p className='font-bold text-2xl'>Gabriel Torres</p>
                <p className='text-[#B2B2B2]'>Administrador</p>
              </div>
            </div>
          </div>
          <div className="menuItems">
            <nav className="mt-6">
              <ul className="space-y-2 px-8">
                <li>
                  <a href="#" className="flex items-center gap-2 p-2 rounded">
                    <span><FaPhone size={22}/></span>
                    <span className='font-bold text-2xl'>PBX — Ligações</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 p-2 rounded text-gray-400">
                    <span ><FaBullseye size={22}/></span>
                    <span className='font-bold text-2xl'>Metas</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="sideBarDownMenu bg-purple-200">
          </div>
        </div>
        <div className="mainContent w-[clamp(200px,81vw,100vw)] p-8 bg-linear-45 from-[#f1f1f7] to-[#f8f8ff]">
          <div className="mainContentContainer h-full w-full">
            <div className="title mb-8">
              <h2 className='text-4xl font-bold'>PBX Interno da Syngoo</h2>
              <p>Sistema de ligações através de ramais e configurações avançadas.</p>
            </div>
            <div className="lineChartCallsContainer">
              <h3 className='text-3xl font-bold'>Ligações em Tempo Real</h3>
              {/* from-[#e8e8ee] to-[#f2f2f8]  */}
              <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#e8e8ee] to-[#f2f2f8] px-2 py-4 shadow-[4px_4px_15px_#c9c9c922] mt-2">
                <div className='containerDiasFiltro'>
                  <div className="containerBotoesDiasFiltro flex gap-1">
                    <div className={`botao-dia ${dias.includes(2) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(2)}>SG</div>
                    <div className={`botao-dia ${dias.includes(3) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(3)}>TE</div>
                    <div className={`botao-dia ${dias.includes(4) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(4)}>QA</div>
                    <div className={`botao-dia ${dias.includes(5) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(5)}>QI</div>
                    <div className={`botao-dia ${dias.includes(6) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(6)}>SX</div>
                    <div className={`botao-dia ${dias.includes(0) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(0)}>SB</div>
                    <div className={`botao-dia ${dias.includes(1) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(1)}>DM</div>
                  </div>
                </div>
                <div className='h-[400px]'>
                  <ResponsiveLine 
                  data={ligacoes ? ligacoes : []}
                  // Config da linha
                  lineWidth={3}
                  pointSize={0} // 0 remove os pontos
                  curve='monotoneX' // Formato da curva da(s) linha(s)
                  enablePointLabel={true}
                  pointLabelYOffset={-20} // distância do rótulo para cima
                  
                  
                  // Eixos
                  yScale={{ type: 'linear', min: '0', max: 'auto', stacked: false, reverse: false }}
                  // AQUI entra o gradiente do site
                  defs={[
                    {
                      id: 'linha-gradiente',
                      type: 'linearGradient',
                      gradientTransform: 'rotate(9)', // ou use x1/y1/x2/y2
                      colors: [
                        { offset: 0, color: '#002f49' },
                        { offset: 100, color: '#002f4999' }
                      ],
                      x1: 0,
                      y1: 0,
                      x2: 1,
                      y2: 0
                    },
                  ]}
                  colors={() => 'url(#linha-gradiente)'}
                  // Config da área SVG
                  margin={{ top: 35, right: 25, bottom: 25, left: 30 }}
                  enableTouchCrosshair={true}
                  useMesh={true}
                  tooltip={Tooltip1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default App
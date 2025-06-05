  import { useState, useRef, useEffect } from 'react'

  import './styles/App.css'
  import {stringify, v4 as uuidv4} from 'uuid'
  import { FaPhone } from "react-icons/fa6"
  import { FaBullseye } from "react-icons/fa6"
  import { GetColaboradores, GetLigacoes } from './services/api'
  import { ResponsiveLine } from "@nivo/line";

  import DiasFiltro from './components/filters/filtrosDeDiasSemana/filtroDeDiasSemana'
  import BotaoFiltroOrdenado from './components/filters/BotaoFiltroOrdenado/BotaoFiltroOrdenado'
  import BotaoAtivoDesativo from './components/filters/BotaoAtivoDesativo/BotaoAtivoDesativo'
  import InputDeData from './components/filters/InputDeData/InputDeData'
  import { formatDate } from './utils/formatter'


  // Faixa no svg do gráfico
  const FaixaHorizontal = ({ yScale, innerWidth }) => {
    const y1 = yScale(50)
    const y2 = yScale(0)

    return (
      <g>
        <rect
          x={0}
          y={y1}
          width={innerWidth}
          height={y2 - y1}
          fill="#ff000033" // vermelho com transparência
        />
      </g>
    )
  }
  
  function App() {
    // Data linechart 
    const [ligacoes, setLigacoes] = useState([])
    // Linechart variables
    const [diasAtivos, setDiasAtivos] = useState([0,1,2,3,4,5,6])

    const [colaboradores, setColaboradores] = useState([])
    const [modoY, setModoY] = useState('ligacoes_totais') // ligacoes_totais || media_movel
    const [periodoMediaMovel, setPeriodoMediaMovel] = useState(1)
    const [tipoPeriodo, setTipoPeriodo] = useState('dia') // dia || mes
    const [agrupadoPorChamador, setAgrupadoPorChamador] = useState(false)
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    // Dropdown list
    const [isOpen, setIsOpen] = useState(false);
    const [chamadorSelecionado, setChamadorSelecionado] = useState([]);
    // Todos colabs ou só ativos
    const [todosAtivos, setTodosAtivos] = useState(true)
    
    // Criação da referência necessária para o handleClickOutside
    const dropdownRef = useRef(null);

    // Use effect para o 'clique fora' do dropdown list. Precisa de um só pra ele por conta do return.
    useEffect(() => {
        // ? Essa função faz com que, quando clicamos fora do container de seleção do dropdown list, o dropdown list se feche
        function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    })
    // useEffect para abertura da página
    useEffect(() => {
      // ? Função para pegar os colaboradores
      async function GetColaboradoresApp(){
        try{
            const resposta = await GetColaboradores(todosAtivos)
            setColaboradores(resposta)
          } catch(erro){
          console.log('Erro ao buscar os dados:', erro.message);
        }
      }
      GetColaboradoresApp()
    }, [todosAtivos])
    useEffect(() => {
      // ? Função para pegar dados de ligação
      async function PegaLigacoes(){
        try{
          const response = await GetLigacoes({
            ...(diasAtivos && {dias: diasAtivos}),
            ...(chamadorSelecionado && {chamadores: chamadorSelecionado}),
            ...(modoY && {modo_y: modoY}),
            ...(periodoMediaMovel && {periodo_media_movel: periodoMediaMovel}),
            ...(tipoPeriodo && {tipo_periodo: tipoPeriodo}),
            ...(agrupadoPorChamador && {agrupamento_por_chamador: agrupadoPorChamador}),
            ...(dataInicio && {inicio: dataInicio}),
            ...(dataFim && {fim: dataFim}),
          })
          const comUID = response.map(item => ({ // Responsável por inserir o uid
            ...item, _uid: uuidv4()
          }))
          // Caso não tenha colaborador. Significa que o agrupamento é por data. Portanto apenas x e y simples.
          let dados_tratados = []
          if (response.length && !response[0].colaborador){
            dados_tratados = response.map(item => ({
              x: formatDate(item.periodo, true),
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
            const data = todasDatas
              .map(dataISO => ({
                x: formatDate(dataISO, true), // ainda usamos formatDate aqui
                y: dataMap[dataISO] !== undefined ? dataMap[dataISO] : null,
                originalDate: dataISO // guardamos a data real
              }))
              .sort((b, a) => new Date(a.originalDate) - new Date(b.originalDate)) // ordenamos pela data real

            // Removemos o campo auxiliar antes de passar pro gráfico
            return {
              id: colaborador,
              data: data.map(({ x, y }) => ({ x, y }))
            }
          })

            setLigacoes(resposta_final)
          }

          // console.log(`Dados: ${JSON.stringify(dados_tratados)}`)
        } catch(error){
          console.log(`O erro: ${error}`)
        }
      }
      PegaLigacoes()
    }, [diasAtivos, chamadorSelecionado, modoY, periodoMediaMovel, tipoPeriodo, agrupadoPorChamador, dataInicio, dataFim])


    // groupp TOGGLES
    const toggleDiaDaSemana = (dia) =>{
      if (diasAtivos.includes(dia)){
        setDiasAtivos(diasAtivos.filter(d => d !== dia));
      } else {
        setDiasAtivos([...diasAtivos, dia])
      }
    }

    const toggleTipoPeriodo = () =>{
      tipoPeriodo == 'dia' ? setTipoPeriodo('mes') : setTipoPeriodo('dia')
    }

    const toggleAgrupamentoPorChamador = () => {
      agrupadoPorChamador ? setAgrupadoPorChamador(false) : setAgrupadoPorChamador(true)
    }

    const toggleModoY = () => {
      modoY == 'ligacoes_totais' ? setModoY('media_movel') : setModoY('ligacoes_totais')
    }

    // Criação do Tooltip personalizado
    const Tooltip1 = ({point}) => (
      <div className='bg-[#00000081] backdrop-blur-[5px] p-2 border-1 border-white shadow-xl rounded-xl text-white mb-5 whitespace-nowrap'>
        <h3 className='font-bold text-xl'>{point.seriesId}</h3>
        <p className='whitespace-nowrap'>{`Data: ${point.data.xFormatted}`}</p>
        <p className='whitespace-nowrap'>{`Quantidade: ${point.data.yFormatted}`}</p>
      </div>
    )


  // Aqui é sobre o dropdown list
  const toggleOption = (option) => {
    setChamadorSelecionado((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    )
  }

  const itemsBotaoTipoPeriodo = {
        1: {placeholder: 'DIA', valor: 'dia'},
        2: {placeholder: 'MÊS', valor: 'mes'},
    }
  const itemsBotaoAgrupamento = {
        1: {placeholder: 'TOTAL', valor: false},
        2: {placeholder: 'CHAMADOR', valor: true},
    }
  const itemsBotaoModoY = {
        1: {placeholder: 'TOTAL', valor: 'ligacoes_totais'},
        2: {placeholder: 'MÉDIA MÓVEL', valor: 'media_movel'},
    }

    
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
              <div className="relative w-full rounded-xl bg-gradient-to-r from-[#e8e8ee] to-[#f2f2f8] px-2 py-4 shadow-[4px_4px_15px_#c9c9c922] mt-2">
                <div className="containerMasterFiltros flex gap-5">
                  <div className='containerDiasFiltro'>
                      <DiasFiltro dias={diasAtivos} toggleDiaDaSemana={toggleDiaDaSemana} listaDeIdsAtivos={diasAtivos}/>
                  </div>
                  <div className="containerTipoPeriodoFiltro">
                    <div className="containerBotoesTipoPeriodoFiltro text-center">
                      <BotaoFiltroOrdenado setador={setTipoPeriodo} items={itemsBotaoTipoPeriodo} titulo='Tipo Período'/>
                    </div>
                  </div>
                  <div className="containerAgrupamentoPorChamadorFiltro w-30">
                    <div className="containerBotoesAgrupamentoPorChamadorFiltro text-center">
                      <BotaoFiltroOrdenado setador={setAgrupadoPorChamador} items={itemsBotaoAgrupamento} titulo='Agrupamento'/>
                    </div>
                  </div>
                  <div className="containerModoY w-35">
                    <div className="containerBotoesModoY text-center">
                      <BotaoFiltroOrdenado setador={setModoY} items={itemsBotaoModoY} titulo='Tipo de Info'/>
                    </div>
                  </div>
                  <div className="containerPeriodosMediaMovel">
                    <div className="containerBotoesPeriodosMediaMovel text-center">
                      <p className={`mb-1 font-semibold ${modoY !== 'media_movel' ? 'text-gray-400' : ''}`}>Períodos</p>
                        <input disabled={modoY !== 'media_movel'} className={`${modoY !== 'media_movel' ? 'input-number-inativo' : 'input-number-ativo'}`} type="number" name="periodos_media_movel" id="periodos_media_movel" onChange={(e) => setPeriodoMediaMovel(e.target.value)} />
                    </div>
                  </div>
                  <div className="containerDataInicio">
                    <div className="containerBotoesDataInicio text-center">
                      <InputDeData setador={setDataInicio} titulo='Inicio' max={dataFim}/>
                    </div>
                  </div>
                  <div className="containerDataInicio">
                    <div className="containerBotoesDataInicio text-center">
                      <InputDeData setador={setDataFim} titulo='Teste Fim' min={dataInicio}/>
                    </div>
                  </div>
                </div>
                
                {/* asdasd */}
                <div className="asd flex pt-3 gap-3">
                  <div ref={dropdownRef} className="relative inline-block w-[87%]">
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full font-medium rounded text-left bg-gray-100 shadow-sm px-4 py-2 cursor-pointer focus:ring-2 focus:outline-1 focus:ring-[#000e2533]0"
                    >
                      {chamadorSelecionado.length > 0
                        ? `Chamadores: ${chamadorSelecionado.join(", ")}`
                        : "Selecione colaboradores"}
                    </button>
                    {isOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-[#fff9] backdrop-blur-[7px] rounded shadow-md max-h-[300px] overflow-y-auto">
                        {colaboradores.map((colaborador) => (
                          <label
                            key={colaborador.id}
                            className="flex items-center px-4 py-2 hover:bg-gradient-to-r text-[#222] from-[#fff0] to-[#000e2533] hover:text-black cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={chamadorSelecionado.includes(`${colaborador.primeiro_nome} ${colaborador.sobrenome}`)}
                              onChange={() => toggleOption(`${colaborador.primeiro_nome} ${colaborador.sobrenome}`)}
                              className="mr-2"
                            />
                            {`${colaborador.primeiro_nome} ${colaborador.sobrenome}`}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className='bg-gradient-to-br from-gray-500 to-gray-700 cursor-pointer text-white font-bold flex items-center px-2 rounded shadow-sm hover:bg-gradient-to-br hover:from-green-600 hover:to-green-800 hover:text-gray-200 hover:shadow-[0px_0px_18px_10px_#e7000b12] duration-600' onClick={() => setTodosAtivos(!todosAtivos)}>ATIVOS</div>
                  <div className='bg-gradient-to-br from-gray-500 to-gray-700 cursor-pointer text-white font-bold flex items-center px-2 rounded shadow-sm hover:bg-gradient-to-br hover:from-red-600 hover:to-red-800 hover:text-gray-200 hover:shadow-[0px_0px_18px_10px_#e7000b12] duration-600' onClick={() => setChamadorSelecionado([])}>RESET</div>
                </div>

                <div className='h-[400px]'>
                  <ResponsiveLine 
                  // Configs Gerais
                  data={ligacoes ? ligacoes : []}
                  layers={[
                    FaixaHorizontal, // 👈 fundo colorido vem primeiro
                    'grid',
                    'axes',
                    'lines',
                    'points',
                    'slices',
                    'mesh',
                    'legends'
                  ]}

                  // Config da linha
                  lineWidth={3}
                  pointSize={0} // 0 remove os pontos
                  curve='monotoneX' // Formato da curva da(s) linha(s)
                  enablePointLabel={true}
                  pointLabelYOffset={-20} // distância do rótulo para cima
                  
                  // Marcador
                  markers={[
                    {
                      axis: 'y',
                      value: 100,
                      legend: 'Média',
                      lineStyle: {
                        stroke: '#002f4999',
                        strokeWidth: 2,
                        strokeDasharray: '10 20'
                      },
                      textStyle: {
                        fill: '#002f4999',
                        fontSize: 17
                      }

                    }
                  ]}

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
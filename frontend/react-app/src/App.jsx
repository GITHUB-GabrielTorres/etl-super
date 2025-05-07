import './styles/App.css'
import { useState } from 'react'
import LineChart001 from './components/LineChart001/LineChart001'
import ListOptions001 from './components/ListOptions001/ListOptions001'
import { useEffect } from 'react'

function App() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [chamadoresSelecionados, setChamadoresSelecionados] = useState([]);

  const handleApplyDates = () => {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
  }

  useEffect(() => {
    console.log('Chamadores selecionados:', chamadoresSelecionados);
    // Aqui você pode fazer uma chamada de API ou atualizar algum gráfico
  }, [chamadoresSelecionados]);

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-[#134985] to-[#030a12] flex items-center justify-center py-20'>
      <div className='chart'>
        <div className='h-120 w-[75vw] m-5 bg-[#fff2] backdrop-blur-2xl p-6 rounded-4xl shadow-2xl'>
          <LineChart001 inicio={appliedStartDate} fim={appliedEndDate} chamadores={chamadoresSelecionados} />
        </div>
        <input
          type="date"
          className='bg-white m-2 p-2 rounded-2xl'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className='bg-white m-2 p-2 rounded-2xl'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          className='bg-white m-2 py-2 px-5 rounded-2xl cursor-pointer'
          onClick={handleApplyDates}
        >
          Enviar
        </button>
      </div>
      <div list>
      <ListOptions001 onChange={setChamadoresSelecionados} />
      </div>
    </div>
  )
}

export default App

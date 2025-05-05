import './styles/App.css'
import { useState } from 'react'
import LineChart001 from './components/LineChart001/LineChart001'

function App() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')

  const handleApplyDates = () => {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-purple-700 to-pink-500 flex flex-col items-center justify-center py-20'>
      <div className='h-100 w-[75vw] m-5 bg-[#fff6] backdrop-blur-2xl p-5 rounded-4xl shadow-2xl'>
        <LineChart001 inicio={appliedStartDate} fim={appliedEndDate} />
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
  )
}

export default App

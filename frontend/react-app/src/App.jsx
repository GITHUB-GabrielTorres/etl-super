import { useState } from 'react'
import { useEffect } from 'react'

import './styles/App.css'
import LineChart001 from './components/LineChart001/LineChart001'
import ListOptions001 from './components/ListOptions001/ListOptions001'
import Table001 from './components/Table001/Table001'

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
    <div className='min-h-screen h-full w-full bg-[#F4F5F9] flex'>
      <div className="sideBar w-[clamp(200px,19vw,400px)] border-r-1 border-[#C9C9C9]  grid grid-cols-1 grid-rows-[auto_auto_1fr_auto]">
        <div className="logo px-10 py-8">
          <img src="https://syngoo.com.br/wp-content/uploads/2022/09/syngoo4.png" alt="" />
        </div>
        <div className="userProfileArea p-3 flex justify-center">
          <div className='userProfileContainer flex py-3 justify-center w-[90%] rounded-xl bg-white border-[#DBDBDB] border-2'>
            <div className="profilePicture size-22 rounded-2xl">
              <img className='w-full h-full object-cover rounded-2xl' src="https://avatars.githubusercontent.com/u/128627372?v=4" alt="" />
            </div>
            <div className="name flex flex-col justify-center ml-3">
              <p className='font-bold text-2xl'>Gabriel Torres</p>
              <p className='text-[#B2B2B2]'>Administrador</p>
            </div>
          </div>
        </div>
        <div className="menuItems bg-green-200">
          <nav class="mt-6">
            <ul class="space-y-2 px-8">
              <li>
                <a href="#" class="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
                  <span>📞</span>
                  <span className='font-bold text-2xl'>PBX — Ligações</span>
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 p-2 rounded text-gray-400 cursor-not-allowed">
                  <span >📋</span>
                  <span className='font-bold text-2xl'>Metas</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="sideBarDownMenu bg-purple-200">

        </div>
      </div>
      <div className="mainContent w-[clamp(200px,81vw,100vw)]">
      </div>
    </div>
  )
}

export default App

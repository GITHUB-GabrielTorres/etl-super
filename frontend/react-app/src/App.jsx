import { useState } from 'react'
import { useEffect } from 'react'

import './styles/App.css'
import { FaPhone } from "react-icons/fa6"
import { FaBullseye } from "react-icons/fa6"
import LineChart001 from './components/LineChart001/LineChart001'
import ListOptions001 from './components/ListOptions001/ListOptions001'
import Table001 from './components/Table001/Table001'
import MultiSelectDropdown from './components/MultiSelectDropdown/MultiSelectDropdown'


function App() {
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
          <nav class="mt-6">
            <ul class="space-y-2 px-8">
              <li>
                <a href="#" class="flex items-center gap-2 p-2 rounded">
                  <span><FaPhone size={22}/></span>
                  <span className='font-bold text-2xl'>PBX — Ligações</span>
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 p-2 rounded text-gray-400">
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
            <div className="lineChartCalls rounded-3xl bg-linear-to-r from-[#e8e8ee] to-[#f2f2f8] px-2 py-4 shadow-[4px_4px_15px_#c9c9c922] w-full h-80 mt-2 relative">
              {/* <div className="teste z-1 bg-radial-[at_15%_35%] from-transparent to-[#fff8] from-20% to-90% absolute w-full h-full">

              </div> */}
              <div className="linechart-configs px-2 mb-2 py-1 flex gap-5">
                <div className="endDate bg-[#fffe] px-2 py-1 rounded-[10px_10px_10px_10px]">
                  <label htmlFor="endDate" className='text-[#313131] '>Data Final:</label>
                  <input type="date" id='endDate' className='px-2 text-[#313131]' />
                </div>
                <div className="startDate bg-[#fffe] px-2 py-1 rounded-[10px_10px_10px_10px]">
                  <label htmlFor="startDate" className='text-[#313131]'>Data Inicial</label>
                  <input type="date" id='startDate' className='mx-1 px-2 text-[#313131]' />
                </div>
                <div className="startDate bg-[#fffe] py-1 rounded-[10px_10px_10px_10px]">
                  <MultiSelectDropdown options={['Gabriel','Torres']} />
                </div>
              </div>
              <LineChart001 inicio='2025-04-10' fim='2025-05-08'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

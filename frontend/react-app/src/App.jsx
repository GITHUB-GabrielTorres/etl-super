import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import MyBarChart from './MyBarChart'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='w-200 m-5'>
      <p className='bg-amber-400 text-black font-bold text-8xl p-5 rounded-xl hover:bg-blue-700 duration-200 hover:text-white cursor-pointer'>Olá!</p>
      <div>
      <MyBarChart />
    </div>
    </div>
  )
}

export default App

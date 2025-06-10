import {useState} from 'react'

export default function InputDeData({setador, titulo, min, max}){
    const [dataSelecionada, setDataSelecionada] = useState('')

    const foraDoIntervalo =
        !!dataSelecionada &&
        ((min && dataSelecionada < min) || (max && dataSelecionada > max));

    return(
        <div className="containerBotoesDataInicio text-left">
            <p className='mb-1 font-semibold'>{titulo}</p>
            <input
            max={max}
            min={min}
            className={`bg-gray-100 shadow-sm font-medium rounded px-4 py-1.5 
                ${!dataSelecionada ? 'text-gray-400' : ''} 
                ${foraDoIntervalo  ? 'text-red-500' : ''}`}
            type="date"
            name={titulo}
            id={titulo}
            onChange={(e) => {
                setDataSelecionada(e.target.value); setador(e.target.value)
            }}/>
        </div>
    )
}
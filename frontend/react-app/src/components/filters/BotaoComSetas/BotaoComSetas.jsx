import {useState} from 'react'

import { IoMdArrowDropright } from "react-icons/io";
import { IoMdArrowDropleft } from "react-icons/io";


export default function BotaoComSetas({items = {}, indice, setadorIndice, setadorId, idDesativado}){

    const [ativo, setAtivo] = useState(true)
    const [ultimoStatus, setUltimoStatus] = useState()
    
    const toggleAtivo = () => {
        if (ativo){
            setUltimoStatus(items[indice].valor)
            setadorId(idDesativado)
            setAtivo(!ativo)
        } else {
            setadorId(ultimoStatus)
            setAtivo(!ativo)
        }

    }

    const toggleMore = (index) => {
        if (ativo){
            const indice = Object.keys(items)
            if (indice.includes(String(index + 1))){
                setadorIndice(index + 1)
                // Define o ID com o setadorID
                setadorId(items[index + 1].valor)
            } else {
                setadorIndice(1)
                // Define o ID com o setadorID
                setadorId(items[1].valor)
            }
        }
    }
    const toggleMinus = (index) => {
        if (ativo){
            const indice = Object.keys(items)
            if (indice.includes(String(index - 1))){
                setadorIndice(index - 1)
                // Define o ID com o setadorID
                setadorId(items[index - 1].valor)
            } else {
                setadorIndice(indice.length)
                // Define o ID com o setadorID
                setadorId(items[indice.length].valor)
            }
        }
    }
    const math = parseInt(parseInt(indice) / parseInt(Object.keys(items).length) * 100)
    return(
        <div>
            <p className='mb-1 font-semibold text-center'>Período Data</p>
            <div className="flex">
                <button className={`more z-0 mx-[-10px] ${ativo ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={() => toggleMinus(indice)}><IoMdArrowDropleft size={40} color={`${ativo ? '#434343' : '#43434344'}`}/></button>
                <button className={`main botao botao-dia-ativo text-center z-1 w-25 ${ativo ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleAtivo()} >{items[indice].placeholder}</button>
                <button className={`more z-0 mx-[-10px] ${ativo ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={() => toggleMore(indice)}><IoMdArrowDropright size={40} color={`${ativo ? '#434343' : '#43434344'}`}/></button>
            </div>
            <div className='containerLine w-25 m-auto h-[3px] mt-0'>
                <div className={`line h-[3px] ${ativo ? 'border-[#12dbd4]' : 'border-[#12dbd444]'} border-b-2  duration-550`} style={{ width: `${math}%` }}>
                </div>
            </div>
        </div>
    )
}

// {`botao-dia ${teste ? 'botao-dia-ativo' : 'botao-dia-inativo'}
import { useState } from "react"

export default function BotaoOnOff({valor, variavel, setadorVariavel, regraDeAtivacao}){
    // const [existente, setExistente] = useState(true)
    return(
        <>
            <div className={`botao-dia text-center ${variavel ? 'botao-dia-ativo' : 'botao-dia-inativo'} ${!regraDeAtivacao ? 'shadow-neutral-50 bg-[#0001]! text-gray-400 cursor-not-allowed!' : ''} text-nowrap`}
            onClick={() => regraDeAtivacao ? setadorVariavel(!variavel) : ''}>{valor}</div>
        </>
    )
}
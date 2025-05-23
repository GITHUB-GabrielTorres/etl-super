import {useState} from 'react'

export default function BotaoFiltroOrdenado({setador, items = {}, titulo}){
    const [indiceAtual, setIndiceAtual] = useState(1)

    const toggle = (index) => {
        const indicesExistentes = Object.keys(items)
        if (indicesExistentes.includes(String(index + 1))){
            setIndiceAtual(index + 1)
            setador(items[indiceAtual + 1].valor)
        } else {
            setIndiceAtual(1)
            setador(items[1].valor)
        }
    }
    return(
        <div className="containerBotao text-center">
            <>
                <p className='mb-1 font-semibold'>{titulo}</p>
                <div className={`botao botao-dia-ativo text-center`} onClick={() => toggle(indiceAtual)}>
                {items[indiceAtual].placeholder}
                </div>
            </>        
        </div>
    )
}
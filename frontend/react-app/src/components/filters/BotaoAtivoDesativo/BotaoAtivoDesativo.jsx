export default function botaoAtivoDesativo({id, valor, toggle, listaDeIdsAtivos}){
    const existente = listaDeIdsAtivos.includes(id)
    return(
        <div className={`botao-dia ${existente ? 'botao-dia-ativo' : 'botao-dia-inativo'} text-nowrap`}
        onClick={() => toggle(id)}>{valor}</div>
    )
}
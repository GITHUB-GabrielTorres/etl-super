export default function botaoAtivoDesativo({id, valor, toggle, listaDeIdsAtivos}){
    const teste = listaDeIdsAtivos.includes(id)
    return(
        <div className={`botao-dia ${teste ? 'botao-dia-ativo' : 'botao-dia-inativo'} text-nowrap`}
        onClick={() => toggle(id)}>{valor}</div>
    )
}

const diasRegistro = [
    {dia: 'SG', id: 2},
    {dia: 'TE', id: 3},
    {dia: 'QA', id: 4},
    {dia: 'QI', id: 5},
    {dia: 'SX', id: 6},
    {dia: 'SB', id: 0},
    {dia: 'DM', id: 1},
]

export default function DiasFiltro({dias, toggleDiaDaSemana}){
    return(
        <>
            <p className='mb-1 font-semibold'>Dias da semana</p>
            <div className="containerBotoesDiasFiltro flex gap-1">
                {diasRegistro.map(item => (
                    <div key={item.id} className={`botao-dia ${dias.includes(item.id) ? 'botao-dia-ativo' : 'botao-dia-inativo'}`} onClick={() => toggleDiaDaSemana(item.id)}>{item.dia}</div>
                ))}
            </div>
        </>
    )
}
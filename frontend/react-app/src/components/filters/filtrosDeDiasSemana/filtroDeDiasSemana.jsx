import BotaoAtivoDesativo from "../BotaoAtivoDesativo/BotaoAtivoDesativo"


const diasRegistro = [
{placeholder: 'SG', valor: 2},
{placeholder: 'TE', valor: 3},
{placeholder: 'QA', valor: 4},
{placeholder: 'QI', valor: 5},
{placeholder: 'SX', valor: 6},
{placeholder: 'SB', valor: 0},
{placeholder: 'DM', valor: 1},
]

export default function DiasFiltro({listaDeIdsAtivos, toggleDiaDaSemana}){
    return(
        <>
            <p className='mb-1 font-semibold'>Dias da semana</p>
            <div className="containerBotoesDiasFiltro flex gap-1">
                {diasRegistro.map(item => (
                    <BotaoAtivoDesativo valor={item.placeholder} id={item.valor} toggle={toggleDiaDaSemana} listaDeIdsAtivos={listaDeIdsAtivos}/>
                ))}
            </div>
        </>
    )
}
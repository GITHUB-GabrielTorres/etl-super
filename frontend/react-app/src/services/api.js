import { endpoints } from './endpoints.js';

// Exemplo de filtros (argumento 1 da função)
// filtros_exemplo = {
//     dias: [1,2,3,4,5,6],
//     chamadores: ['Gabriel Torres','Aline Moreira'],
//     modo_y: 'ligacoes_totais',
//     periodo_media_movel: 2,
//     tipo_periodo: 'dia',
//     agrupamento_por_chamador: true,
//     inicio: '2025-01-01',
//     fim: '2025-05-10'
// }

export async function GetColaboradores(){
    const url = `${endpoints.empresa.colaboradores}`

    try{
        const response = await fetch(url,{
            method: 'GET',
            headers: {
                'Accept':'application/json'
            }
        })
        
        if (!response.ok){
            throw new Error(`Erro HTTP: ${response.status}`)
        }

        return await response.json()
    } catch(error) {
        console.error('Erro ao buscar os dados:', error.message);
        return null;
    }
}

// ? Teste funcional de GetColaboradores()
// GetColaboradores().then(response => console.log(response))


/* FUNÇÃO QUE IRÁ REQUISITAR GET NAS LIGAÇÕES, PASSANDO OS ARGUMENTOS QUERYSTRINGS */
export async function GetLigacoes(filtros = {}) {
    // Define o params como tipo URLSearchParams, que é algo voltado à querystrings
    // Aqui ficarão todos os parâmetros passados como querystrings
    const params = new URLSearchParams(filtros);
    // Aqui se monta a url com todos os querystrings
    const url = `${endpoints.pbx.ligacoes}?${params.toString()}`;
    // Bloco que fará a requisição GET
    try {
        // Não terá nada demais, apenas um fetch na url
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        // Caso a requisição não tenha dado certo, ele informa o erro.
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`)
        }
        // Se der tudo certo, ele retorna um json com a resposta
        return await response.json();
    // Caso dê erro no bloco anterior ele traz essa mensagem, com o erro.
    } catch (error) {
        console.error('Erro ao buscar os dados:', error.message);
        return null;
    }
}

// ? Exemplo funcional da consulta de dados de ligações
GetLigacoes({
    dias: [1, 2, 3, 4, 5, 6],
    chamadores: ['Gabriel Torres', 'Aline Moreira'],
    modo_y: 'ligacoes_totais',
    periodo_media_movel: 2,
    tipo_periodo: 'dia',
    agrupamento_por_chamador: false,
    inicio: '2025-01-01',
    fim: '2025-05-10'
}).then(response => {
    // Parte responsável por tratar os nomes
    if (!colaborador){
        const dadosConvertidos = response.map(item => ({
            x: item.periodo,
            y: Number(item.quantidade) || 0
        }));
    }

    console.log(dadosConvertidos);
});
console.log('----')
GetLigacoes({
    dias: [1, 2, 3, 4, 5, 6],
    chamadores: ['Suelen Lidoni', 'Aline Moreira'],
    modo_y: 'ligacoes_totais',
    periodo_media_movel: 2,
    tipo_periodo: 'dia',
    agrupamento_por_chamador: true,
    inicio: '2025-03-01',
    fim: '2025-05-10'
}).then(response => {
    if (!response[0].colaborador) /* Não tem colaborador entra aqui */{
        // ✅ Caso NÃO tenha colaborador (gráfico com uma linha só)
        const dadosConvertidos = response.map(item => ({
            x: item.periodo,
            y: Number(item.quantidade) || 0
        }));

        const resposta_final = [
            {
                id: 'Total',
                data: dadosConvertidos
            }
        ];

        console.log(JSON.stringify(resposta_final, null, 2));
    } else /* Caso tenha colaborador entra aqui */{

        const resposta_formatada = {}
        response.forEach(item => {
            if (!resposta_formatada[item.colaborador]){
                resposta_formatada[item.colaborador] = []
            }
            resposta_formatada[item.colaborador].push({
                x: item.periodo,
                y: item.quantidade
            })
        })
        const resposta_final = Object.entries(resposta_formatada).map(([colaborador, data]) => ({
            id: colaborador,
            data: data
        }))
        // console.log(JSON.stringify(resposta_final, null, 2))
        }
    }
)
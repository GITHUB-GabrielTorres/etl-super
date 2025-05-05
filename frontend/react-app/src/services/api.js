import { endpoints } from './endpoints.js';

export async function GetLigacoesPorDia(inicio, fim) {
    try {
        const response = await fetch(`${endpoints.contatos.list_day}?data_inicio=${inicio}` + (fim ? `&data_fim=${fim}` : ''), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Erro ao buscar os dados:', error.message);
        return null;
    }
}

GetLigacoesPorDia('2025-04-01')
    .then(resultado => {
        console.log('Resultado com then:', resultado);
    })
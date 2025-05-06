import { endpoints } from './endpoints.js';

export async function GetLigacoesPorDia(filtros = {}) {
    // Define o params como tipo URLSearchParams, que é algo voltado à querystrings
    const params = new URLSearchParams();

    // Adiciona filtros, se existirem
    if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
    // Verifica se tem algo em chamadores, e se é array. Se for passa item por item dando append em params.
    if (filtros.chamadores && Array.isArray(filtros.chamadores)) {
        filtros.chamadores.forEach(ch => params.append('chamador', ch));
    }

    const url = `${endpoints.contatos.list_day}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Erro ao buscar os dados:', error.message);
        return null;
    }
}

export async function GetChamadores(){
    try {
        const response = await fetch(`${endpoints.chamadores.list}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Erro ao buscar os dados:', error.message);
        return null;
    }
}

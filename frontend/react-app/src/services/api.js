import { endpoints } from './endpoints.js';


async function GetLigacoesPorDia() {
    try {
        const response = await fetch(endpoints.contatos.list_day, {
            method: 'GET',
            headers: {
            'Accept': 'application/json'
            }
        });

        // Verifica se a resposta é OK (status 200–299)
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        return data;

    } catch (error) {
        console.error('Erro ao buscar os dados:', error.message);
        return null; // ou pode lançar o erro para tratamento externo
    }
}

// Exemplo de uso
console.log(GetLigacoesPorDia())
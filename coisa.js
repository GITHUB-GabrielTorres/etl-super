async function GetPF(cpf) {
    const url = 'https://ssw.inf.br/api/trackingpf';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dominio: "RED",
            usuario: "syngoo",
            senha: "s7ngo0",
            cpf: cpf
        })
    });

    const data = await response.json();
    return data;
}

// Códigos por tipo de ação
const to_human_codes = [
    1, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26,
    28, 29, 30, 33, 34, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47, 48, 49, 50, 52,
    53, 54, 55, 56, 58, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 76, 77,
    78, 79, 81, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99
];
const informar_tracking_codes = [12, 21, 27, 40, 41, 51, 57, 59];
const informar_tracking_e_tentativa_hoje_codes = [9, 31, 32, 60, 74];

// Estruturas de resposta por tipo
const estrutura_to_humano = () => ({
    antes: 'encaminhar_para_humano',
    hoje: 'encaminhar_para_humano',
    depois: 'encaminhar_para_humano',
});
const estrutura_informar_tracking = () => ({
    antes: 'informar_dados_tracking',
    hoje: 'informar_dados_tracking',
    depois: 'Informar entrega atrasada',
});
const estrutura_informar_tracking_e_tentativa_hoje = () => ({
    antes: 'informar_dados_tracking',
    hoje: 'informar_que_será_feita_nova_tentativa_hoje',
    depois: 'Informar entrega atrasada',
});

// Mapeia todos os códigos para suas estruturas
const estrutura_completa = {
    ...Object.fromEntries(to_human_codes.map(codigo => [codigo, estrutura_to_humano()])),
    ...Object.fromEntries(informar_tracking_codes.map(codigo => [codigo, estrutura_informar_tracking()])),
    ...Object.fromEntries(informar_tracking_e_tentativa_hoje_codes.map(codigo => [codigo, estrutura_informar_tracking_e_tentativa_hoje()]))
};

// Função para formatar os dados da API
function RespostaAPI(dados_redesul, data_min = '', nro_nf = '') {
    const dataCorte = new Date(data_min);

    const pedidosFiltrados = dados_redesul.documentos.filter(pedido => {
        const dataPedido = new Date(pedido.tracking[0]?.data_hora);
        const passaData = !data_min || dataPedido >= dataCorte;
        const passaNF = !nro_nf || pedido.header.nro_nf === nro_nf;
        return passaData && passaNF;
    });

    const pedidosFormatados = pedidosFiltrados.map(pedido => {
        const tracking = pedido.tracking;
        const primeiro = tracking[0];
        const ultimo = tracking[tracking.length - 1];

        const matchPrazo = primeiro.descricao.match(/Previsao de entrega: (\d{2}\/\d{2}\/\d{2})/i);
        const prazo = matchPrazo ? matchPrazo[1] : null;

        const matchCode = ultimo.ocorrencia.match(/\((\d+)\)$/);
        const code = matchCode ? parseInt(matchCode[1], 10) : null;

        const ocorrenciaLimpa = ultimo.ocorrencia.replace(/\s*\(\d+\)\s*$/, '').trim();

        const hoje = new Date().toISOString().split('T')[0];
        const dataPrazo = prazo
            ? new Date(`20${prazo.split('/')[2]}-${prazo.split('/')[1]}-${prazo.split('/')[0]}`)
            : null;

        let acao = undefined;

        if (code && estrutura_completa[code]) {
            if (!dataPrazo) {
                acao = estrutura_completa[code].hoje;
            } else if (dataPrazo.toISOString().split('T')[0] === hoje) {
                acao = estrutura_completa[code].hoje;
            } else if (dataPrazo < new Date()) {
                acao = estrutura_completa[code].depois;
            } else {
                acao = estrutura_completa[code].antes;
            }
        }

        return {
            remetente: pedido.header.remetente,
            nro_nf: pedido.header.nro_nf,
            prazo: prazo,
            code: code,
            action: acao,
            data_tracking: ultimo.data_hora,
            ocorrencia: ocorrenciaLimpa,
            descricao: ultimo.descricao
        };
    });

    return pedidosFormatados;
}


// Função principal que integra tudo
async function principal(cpf='', data_min='') {
    try {
        const data = await GetPF(cpf);
        const dados_redesul = data;

        const items = RespostaAPI(dados_redesul, data_min, '');

        console.log('RespostaAPI:', items);
    } catch (err) {
        console.error('Erro ao buscar dados do CPF:', err);
    }
}

// Executa
principal('49713781899');

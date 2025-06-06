from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.db.models.functions import TruncDate, Concat, TruncMonth, TruncTime, ExtractHour, ExtractMinute, TruncYear, TruncWeek, TruncDay, ExtractIsoYear, ExtractMonth
from django.db.models import Count, Value, CharField, Q, OuterRef, Subquery, DateField, When, Case, IntegerField
from rest_framework.response import Response
from .serializers import ContatosPBXSerializer
import pandas as pd
import numpy as np
from django.db.models.functions import ExtractWeekDay
from functools import reduce
from operator import or_

from .models import ContatosPBX, ColaboradorEAliasChamador
from empresa.models import Colaboradores

# View que mostra todas os contatos feitos
class ListaContatos(ListAPIView):
    queryset = ContatosPBX.objects.all()
    serializer_class = ContatosPBXSerializer

# Essa função pega os dados e converte todos em um df do pandas. O que sair daqui deve estar filtrado nas instâncias, deixando somente o que será utilizado.
def gerar_dataframe_ligacoes(request):
    
    ### Os filtros gerais ficarão aqui
    filtros = {}

    ###### ! Parte responsável pelo filtro de DIAS DA SEMANA HABILITADOS
    # Caso não haja nenhum filtro de dias, todos os dias serão adicionados
    dias_possiveis = request.GET.get('dias', '0,1,2,3,4,5,6') # Sábado é 0 e sexta é 6
    # Se houver algo na variável dias_possiveis, ele irá adicionar todos na lista
    if dias_possiveis:
    # Transforma "2,3,4,5,6" em [2, 3, 4, 5, 6]
    # É um List Comprehension, pois é pego o string, e tratado dentro de uma lista
        dias_possiveis = [int(d) for d in dias_possiveis.split(',') if d.strip().isdigit()]
    # Se houver dias selecionados ele insere isso no dic. de filtros
    if dias_possiveis:
        filtros['dia_da_semana__in'] = dias_possiveis

    ###### ! Parte responsável PELAS DATAS DE INÍCIO E FIM
    dia_inicial = request.GET.get('inicio','')
    dia_final = request.GET.get('fim','')
        
    # Adiciona dia inicial
    if dia_inicial:
        filtros['dia__gte'] = dia_inicial
    # Adiciona periodo final
    if dia_final:
        filtros['dia__lte'] = dia_final

    ###### ! Parte responsável pelos PERIODOS
    periodos_validos = ['madrugada', 'manha', 'tarde', 'noite']
    periodos = request.GET.get('periodos', '')


    if periodos:
        periodos = [c.strip() for c in periodos.split(',') if c.strip()]
        # Adiciona apenas os periodos válidos
        periodos_filtrados = [p for p in periodos if p in periodos_validos]

        if periodos_filtrados:
            filtros['periodo__in'] = periodos_filtrados

    ###### ! Parte responsável por filtrar os CHAMADORES
    chamadores = request.GET.get('chamadores', '') # Virá algo como 'Gabriel Torres, Aline Moreira'
    chamadores = [c.strip() for c in chamadores.split(',')]
    # Só adicionamos o filtro de 'chamador' se a lista de chamadores não for vazia
    if chamadores:
        # Aqui pega as informações dos colaboradores e só insere um novo atributo = que é a junção de nome com o sobrenome
        # Usando annotate ele adiciona a coluna 'nome_completo'
        colaboradores_queryset = Colaboradores.objects.annotate(
            # Usa a Concat pra juntar 'primeiro_nome' com 'sobrenome' e define a coluna como CharField
            nome_completo=Concat(
                'primeiro_nome', Value(' '), 'sobrenome', output_field=CharField()
            )
        )
        # Monta um filtro com OR para todos os nomes enviados
        # O reduce vai iterando a função
        # O Q é apenas uma forma de filtrar
        # O or_ é o equivalente a dizer 'ou', é o ||
        # Portanto a função abaixo faz o seguinte, para cada nome que está em chamadores ele verifica se contém em 'nome completo' que é o atributo novo da tabela de colaboradores, que foi criada antes.
        filtro_nomes = reduce(
            # List Comprehension criando uma lista com os nomes, porém adicionando apenas o nome_completo caso esteja em chamadores
            or_, [Q(nome_completo__icontains=nome) for nome in chamadores]
            # RESULTADO ESPERADO: [nome_completo_icontains='Gabriel Torres',nome_completo_icontains='Aline Moreira']
            # Isso garante que teremos uma filtro que pedirá apenas os nomes que tinhamos escolhido
        )

        # Aplica o filtro criado no queryset de colaboradores
        colaboradores = colaboradores_queryset.filter(filtro_nomes)
        # RESULTADO ESPERADO: A entidade inteira de Colaboradores, porém filtrado somente os chamadores solicitados
        # Com os colaboradores em mãos, busca os nomes errados mapeados
        # Isso está olhando lá em alias, pegando tudo que tem nome errado na entidade de ligação
        nomes_errados = ColaboradorEAliasChamador.objects.filter(
            # Aqui é pego os ids dos colaboradores solicitados. Essa lista será usada para pegar todos os nomes errados
            # Aqui já define-se o filtro pegando, no atributo de colaborador_id só os ids dos colaboradores solicitados
            colaborador_id__in=colaboradores.values_list('id', flat=True)
            # RESULTADO ESPERADO: Na entidade de Alias ele filtra só os ids dos Chamadores escolhidos
        ).values_list('nome_errado', flat=True) # Agora, tendo a entidade de Alias filtrada só com os Colaboradores solicitados, faz uma lista com os nomes errados
        # RESULTADO ESPERADO: ['nome_errado1','nome_errado2','nome_errado3'] <= De todos os colaboradores solicitados

        # Agora sim: usa essa lista de nomes errados como filtro nas ligações
        filtros['chamador__in'] = list(nomes_errados)


    dados = (
        ContatosPBX.objects.all()
        .filter(~Q(quem_recebeu_ligacao = 'h')) # filtra o que não foi ligação
        .annotate(
            ano=TruncYear('data_de_contato'),
            ano_cod=ExtractIsoYear('data_de_contato'),
            mes=TruncMonth('data_de_contato'),
            mes_cod=ExtractMonth('data_de_contato'),
            semestre=Case(
                When(mes_cod__in=[1,2,3,4,5,6], then=Value(1)),
                When(mes_cod__in=[7,8,9,10,11,12], then=Value(2))
            ),
            trimestre=Case(
                When(mes_cod__in=[1,2,3], then=Value(1)),
                When(mes_cod__in=[4,5,6], then=Value(2)),
                When(mes_cod__in=[7,8,9], then=Value(3)),
                When(mes_cod__in=[10,11,12], then=Value(4)),
            ),
            semana=TruncWeek('data_de_contato'),
            dia_da_semana=ExtractWeekDay('data_de_contato'),
            dia=TruncDay('data_de_contato'),
            horario=TruncTime('data_de_contato'),
            hora=ExtractHour('data_de_contato'),
            minuto=ExtractMinute('data_de_contato'),
            periodo=Case(
                When(hora__lt=5, then=Value('madrugada')),
                When(hora=5, minuto__lt=30, then=Value('madrugada')),
                When(hora=5, minuto__gte=30, then=Value('manha')),
                When(hora__gte=6, hora__lt=12, then=Value('manha')),
                When(hora__gte=12, hora__lt=19, then=Value('tarde')),
                default=Value('noite'),
                output_field=CharField()
            )
        )
        .filter(**filtros)
    )

    df = pd.DataFrame(list(dados.values()))

    # Parte responsável por inserir o nome correto no resultado final
    colaborador_map = {
        alias.nome_errado: f"{alias.colaborador.primeiro_nome} {alias.colaborador.sobrenome}"
        for alias in ColaboradorEAliasChamador.objects.select_related('colaborador').all()
    }
    if not df.empty and 'chamador' in df.columns:
        df['chamador'] = df['chamador'].map(colaborador_map)

    return df

# ! ------------------------------------------
# ! ------------------------------------------
class DadosCrus(APIView):
    def get(self, request):
        dados = gerar_dataframe_ligacoes(request)


        ### ? Parte responsável pelos STATUS
        # Lista com os status corretos, para um de-para
        status_corretos = {
            'atendido': 'ANSWERED',
            'ocupado': 'BUSY',
            'falhou': 'FAILED',
            'sem resposta': 'NO ANSWER',
        }
        # Pega as informações passadas no querystring
        status = request.GET.get('status','')
        # Transforma o resultado da querystring em uma lista, separando os itens em vírgulas e tirando os espaços no início e fim. Também só faz isso caso esteja em status_corretos
        status = [s.strip() for s in status.split(',') if s.strip() in status_corretos]
        # Resultado esperado: [atendido, ocupado, falhou, sem resposta]
        status = [status_corretos[s] for s in status]
        # Resultado esperado: [ANSWERED, BUSY, FAILED, NO ANSWER]
#?
#?
#?
#?
#?
#?
#?
#?
        # dados = dados.head(10)
        # dados = dados.groupby('status').size().reset_index(name='quantidade')
        # dados_por_status = dados.groupby(['status','dia']).size().reset_index(name='quantidade')
        # total_por_dia = dados.groupby('dia').size().reset_index(name='total_do_dia')

        # dados = total_por_dia.merge(dados_por_status, on='dia')
        # dados['porc'] = dados['quantidade'] / dados['total_do_dia']
        # # dados = dados.drop(['quantidade','total_do_dia'], axis=1)
        # dados = dados[ dados['status'].isin(status)]
        # dados = dados.groupby('dia')['porc'].sum().reset_index()

#?
#?
#?
#?
#?
#?
#?
#?
#?
#?
        return Response(dados.to_dict(orient='records'))
# ! ------------------------------------------
# ! ------------------------------------------

# TODO ########## LIGACOES2 ##########
class Ligacoes2(APIView):
    def get(self, request):
        # ! ENTENDIMENTO GERAL #################################################################################
        # ? Escopo geral: Essa classe trará informações de ligações feitas pelo PBX.
        # ? O resultado esperado são uma lista de objetos, que possuirão em si uma lista de outros objetos. Isso é como o gráfico NIVO espera.
        # ? Exemplo de resultado com o seguinte: agrupado por chamador, quantidade de ligações totais por trimestre (temos 2 apenas até agora):
        """ [
                {
                    "id": "Alan Martinski",
                    "data": [
                        {
                            "x": "1",
                            "y": 23
                        },
                        {
                            "x": "2",
                            "y": 11
                        }
                    ]
                },... """
        # ! Lógica geral ##########################################
        # ? Primeiro serão tratados os querystrings.
        # ? Depois será feita a construção do resultado com base nos querystrings.
        # ? Por fim é ajustada a estrutura para a esperada pelo NIVO.


        # ! Querystrings esperadas ##########################################

        # groupp FILTROS NA BASE -----------------------------------
        ## ! dia da semana = list - Lista dos dias semanais que devem ser filtrados
        ### ? [0,1,2,3,4,5,6]

        ## ! periodos_dia = list - Quais os períodos devem ser filtrados
        ### ? [madrugada, manha, tarde, noite]

        ## ! inicio = date - Data inicial dos dados
        ### ? 2025-05-01

        ## ! fim = date - Data final dos dados
        ### ? 2025-05-10

        ## ! chamadores = list - Lista dos chamadores que devem ser filtrados
        ### ? [Gabriel Torres, Igor Vaz]

        # groupp / FILTROS NA BASE -----------------------------------



        # groupp MANIPULAÇÃO  -----------------------------------

        ## ! eixo = string - Definição do eixo X
        ###? nogroup
        ###? dia
        ###? semana
        ###? mes
        ###? trimestre
        ###? semestre
        ###? ano

        ## ! agrupamento = string - Sobre sobre qual valor será agrupado o cálculo
        ###? nogroup
        ###? chamador
        ###? periodo
        ###? status

        ## ! calculo = string - Definição do eixo Y - cálculo dos dados
        ###? media_movel
        ###? soma_total
        ###? porcentagem_status

        ## ! [CASO CALCULO == MEDIA_MOVEL] periodos_media_movel = int - Alterador do eixo Y - Quantos períodos para o cálculo da MÉDIA_MÓVEL
        ###? 1
        ###? 2
        ###? 3 ...

        ## ! status = list - Filtro de status na visualização (Precisa ser feito aqui, e não na função de gerar_dataframe_ligacoes)
        ###? [atendido, ocupado, falhou, sem resposta]

        ## ! [CASO CALCULO == PORCENTAGEM_STATUS] todos_status = bool - Alterador do eixo Y - Aqui se define se o cálculo será feito sobre todos os status ou somente pelos filtrados
        #? 1 / true
        #? 0 / false

        ## ! [CASO CALCULO == PORCENTAGEM_STATUS] porcentagem_sobre_si = bool - Alterador do eixo Y - Aqui se define se o cálculo será feito sobre o grupo ou se deixará o filtro de grupo de fora
        #? 1 / true
        #? 0 / false

        ## pendente i- variacao = bool - Alterador do eixo Y - Se será mostrado o valor ou só sua variação com o período anterior
        ###? true
        ###? 1

        # groupp / MANIPULAÇÃO  -----------------------------------

# ! -------# ------------------# ------ CÓDIGO ----------# -----------------------# ---------------# -------
        # groupp Parte responsável por pegar os AGRUPAMENTO
        #? Periodo, status, chamador, hora, nogroup
        # TODO nogroup
        agrupamento = request.GET.get('agrupamento', 'chamador') # Caso nada, ficará 'chamador'

        # groupp Parte responsável pelo MODO
        # O modo é um formatador final, para o gráfico específico
        modo = request.GET.get('modo','')

        # groupp Parte responsável pelo STATUS
        # ? São os seguintes: atendido, ocupado, falhou, sem resposta
        status = request.GET.get('status','')

        # Lista com os status corretos, para um de-para
        status_corretos = {
            'atendido': 'ANSWERED',
            'ocupado': 'BUSY',
            'falhou': 'FAILED',
            'sem resposta': 'NO ANSWER',
        }

        # Transforma o resultado da querystring em uma lista, separando os itens em vírgulas e tirando os espaços no início e fim. Também só faz isso caso esteja em status_corretos
        # EX. DE INPUT: "atendido,    ocupado, falhou"
        status = [s.strip() for s in status.split(',') if s.strip() in status_corretos]
        # EX. DE OUTPUT: [atendido, ocupado, falhou]

        # Resultado esperado: [atendido, ocupado, falhou, sem resposta]
        # EX. DE INPUT: [atendido, ocupado, falhou]
        status = [status_corretos[s] for s in status]
        # EX. DE OUTPUT: [ANSWERED, BUSY, FAILED]

        # Caso status esteja vazio, ele pegará todos os status
        if not status:
            # Isso pega todos os valores de status_corretos e insere em uma lista
            status = list(status_corretos.values())
            # OUTPUT EXATO: [ANSWERED, BUSY, FAILED, NO ANSWER]

        ### groupp Parte responsável pelo calculo
        ### ? São os seguintes: media_movel || ligacoes_totais || porcentagem_status
        calculo = request.GET.get('calculo','soma_total')

        ### groupp Parte responsável por pegar PERIODO_MEDIA_MOVEL
        ### ? Integer básico para definir a distância do média móvel
        media_movel_periodos = int(request.GET.get('periodo_media_movel',1))

        ### groupp Parte responsável por pegar PORCENTAGEM_SOBRE_SI
        ### ? Boleano simples. Aplicável apenas se CALCULO == PORCENTAGEM_STATUS. Isso definirá se ele considerará os valores de todos, ou só do seu próprio grupo. Exemplo ilustrativo, supondo que estamos agrupando por chamador, você quer ver a % dele sobre as ligações dele, ou sobre as ligações gerais?
        # Sobre a porcentagem do status. Caso True ele pegará apenas as suas ligações para descobrir a porcentagem
        porcentagem_sobre_si = request.GET.get('porcentagem_sobre_si','1')
        # Se for 1 ou true, então verdadeiro, se não, falso.
        porcentagem_sobre_si = porcentagem_sobre_si in ['1','true']

        ### groupp Parte responsável por pegar todos_status
        ### ? Só aplicável se CALCULO == PORCENTAGEM_STATUS. É um Boleano simples. Se esse positivo, portanto todos os status serão considerados, se não, somente os filtrados
        # ? Exemplo: Caso esteja filtrado atendidos, e aqui esteja falso, e não seja uma análise sobre si, e o dado esteja manhã: 52%. Significa que 52% dos atendidos são de manhã. Caso ative esse, todos os status seriam considerados, e os 52% se tornariam, por exemplo, 20%. Significa que 20% é a representação de todas atendidos de manhã com base em todas ligações de todos status.
        todos_status = request.GET.get('todos_status','1')
        # Se for 1 ou true, então verdadeiro, se não, falso.
        todos_status = todos_status in ['1','true']

        ### groupp Parte responsável pelos TIPOS DE PERIODO
        ### ? Aqui se definirá o eixo x. Portanto: Ano, Semestre, Trimestre, Mês, Semana, Dia
        periodo_desejado = request.GET.get('tipo_periodo', 'dia')

        # groupp Aqui estamos utilizando a função para trazer o DF preparado e previamente tratado e filtrado.
        dados = gerar_dataframe_ligacoes(request)
        """ DADOS BRUTOS — RESPOSTA DE gerar_dataframe_ligacoes
        {
            "codigo_unico": "20250603101223_2025-06-03 10:37:50_BUSY",
            "protocolo": "20250603101223",
            "data_de_contato": "2025-06-03T10:37:50Z",
            "quem_ligou": "136",
            "quem_recebeu_ligacao": "5433438000",
            "grupo_discagem_saida": "DLPN_Algar",
            "duracao_em_segundos": 5,
            "status": "BUSY",
            "nome_do_tronco": "Algar",
            "chamador": "Leticia Machado",
            "ano": "2025-01-01T00:00:00Z",
            "ano_cod": 2025,
            "mes": "2025-06-01T00:00:00Z",
            "mes_cod": 6,
            "semestre": 1,
            "trimestre": 2,
            "semana": "2025-06-02T00:00:00Z",
            "dia_da_semana": 3,
            "dia": "2025-06-03T00:00:00Z",
            "horario": "10:37:50",
            "hora": 10,
            "minuto": 37,
            "periodo": "manha"
        }, """
        # ? O gráfico será formado de 3 coisas principais, QUEM, QUANTO E QUANDO. Quem é o ID, Quanto é a quantidade (eixo Y), e Quando são os períodos (eixo X).
        # o_que_cada_coisa_exemplo = {
        #     id1: [
        #         {'x': 'dia 1', 'y': '50'},
        #         {'x': 'dia 2', 'y': '52'},
        #         {'x': 'dia 3', 'y': '54'},
        #     ],
        #     id2: [
        #         {'x': 'dia 1', 'y': '56'},
        #         {'x': 'dia 2', 'y': '58'},
        #         {'x': 'dia 3', 'y': '60'},
        #     ]
        # }
        ### groupp Agrupamentos Organizados
        groupby_usados = []

        # Filtra os status
        if status and calculo != 'porcentagem_status':
            print('teste ==========================')
            dados = dados[dados['status'].isin(status)]

        if agrupamento != 'nogroup':
            groupby_usados.append(agrupamento)

        if periodo_desejado != 'nogroup':
            groupby_usados.append(periodo_desejado)

        # Quando é trimestre ou semestre é preciso inserir o agrupamento por ano, pra depois criar um identificador.
        if periodo_desejado in ['trimestre','semestre']:
            groupby_usados.append('ano_cod')

        ### groupp Manipulação  = --- -- - + - -- --- = --- -- - + - -- --- =
        ### ? Verifica o cálculo e ajusta de acordo.
        # Caso soma_total é simples, basta agrupar e contar as linhas.
        if calculo == 'soma_total': # groupp funcionando
            # Verifica se há agrupamentos a serem feitos, caso sim usa-os
            if groupby_usados:
                dados = dados.groupby(groupby_usados).size().reset_index(name='quantidade')
                if 'ano_cod' in dados.columns:
                    dados[f'periodo_data'] = dados['ano_cod'].astype(str) + '.' + dados[periodo_desejado].astype(str)
                    dados = dados[[agrupamento, 'periodo_data', 'quantidade']].rename(columns={
                        agrupamento: 'nome'
                    })
                else:
                    dados = dados[[agrupamento, periodo_desejado, 'quantidade']].rename(columns={
                        agrupamento: 'nome',
                        periodo_desejado: 'periodo_data'
                    })

            # Caso não haja agrupamentos (ambos são nogroup) será criado um DF com o tamanho.
            else:
                dados = pd.DataFrame([{
                    'nome':'Total Ligacoes',
                    'quantidade':len(dados),
                }])

        elif calculo == 'media_movel':
            if groupby_usados:
                print('tem agrupamentos')
                dados = dados.groupby(groupby_usados).size().reset_index(name='soma_total')
                # Se agrupamento = vazio
                if agrupamento == 'nogroup': # groupp funcionando
                    print('agrupamento é nogroup')
                    # Cria uma coluna para servir de id.
                    dados['nome'] = 'Total'
                    # Faz a média móvel.
                    dados['quantidade'] = dados['soma_total'].rolling(window=media_movel_periodos, min_periods=1).mean().reset_index(level=0, drop=True)
                    # Define as colunas que irão ficar e as renomeia.
                    dados = dados[['nome', periodo_desejado,'quantidade']].rename(columns={
                        periodo_desejado:'periodo_data'
                    })
                    # Verifica se há a coluna ano_cod em dados. Se houver significa que foi inserida pelo groupby em groupby_usados. Portanto está na lista de periodos que precisa de identificação com ano (trimestre e semestre)
                    if 'ano_cod' in dados.columns: # groupp funcionando
                        print('ano_cod está em dados como coluna')
                        # Cria o código se for trimestre ou semestre
                        dados[f'codigo_{periodo_desejado}'] = dados['ano_cod'].astype(str) + '.' + dados[periodo_desejado].astype(str)
                        dados = dados[['nome',f'codigo_{periodo_desejado}', 'quantidade']].rename(columns={
                            f'codigo_{periodo_desejado}':'periodo_data'
                        })
                else:
                    print('agrupamento não é nogroup') # groupp funcionando
                    # Aqui prcisa agrupar pelo agurpamento para fazer o cálculo, pois ele precisa isolar os mesmos tipos.
                    rolling_result = dados.groupby(agrupamento)['soma_total'].rolling(window=media_movel_periodos, min_periods=1).mean().reset_index(drop=True)
                    dados['quantidade'] = rolling_result
                    # Resultado esperado: { agrupamento, periodo_desejado, soma_total, quantidade }
                    if 'ano_cod' in dados.columns:
                        print('ano_cod está em dados como coluna')
                        dados[f'codigo_{periodo_desejado}'] = dados['ano_cod'].astype(str) + '.' + dados[periodo_desejado].astype(str)
                        # Decide as colunas que permanecerão, e altera seus nomes para ficarem com nome, periodo_data e quantidade.
                        dados = dados[[agrupamento, f'codigo_{periodo_desejado}', 'quantidade']].rename(columns={
                            # Renomeando as selecionadas
                            agrupamento: 'nome',
                            f'codigo_{periodo_desejado}': 'periodo_data',
                        })
                    else:
                        dados = dados[[agrupamento, periodo_desejado, 'quantidade']].rename(columns={
                            # Renomeando as selecionadas
                            agrupamento: 'nome',
                            periodo_desejado: 'periodo_data',
                        })

                    
            else:
                # Média móvel com tudo nogroup não tem como, apenas retornará a quantidade total de ligaçõe.
                dados = pd.DataFrame([{
                    'nome':'Total Ligacoes',
                    'quantidade':len(dados),
                }])

        # Caso o calculo seja porcentagem_status ele irá pegar o total, depois o que a pessoa conseguiu, e dividirá um pelo outro, deixando apenas o resultado.
        # Há uma divisão com IF, pois o 'porcentagem_sobre_si' decide se será considerado apenas os números do grupo, ou se tudo.
        elif calculo == 'porcentagem_status':

            # pendente - Caso agrupamento nogroup e periodo ok
            # pendente i- { nome = total, periodo_data, quantidade}

            # pendente - Caso agrupamento ok e periodo nogroup
            # pendente i- { nome = agrupamento, periodo_data = 'total', quantidade = calculo normal}
            
            # pendente - Caso ambos nogroup
            # pendente icheck- { nome = total, periodo_data = total, quantidade = calculo normal}

            # Caso ambos nogroup ele retorna a porcentagem daquele status no total.
            if not groupby_usados:
                atingido = len(dados[dados['status'].isin(status)])
                total_grupo_filtrado = len(dados[dados['status'].isin(list(status_corretos.values()))])
                dados = pd.DataFrame([{
                    'nome':'Porcentagem total',
                    'quantidade':atingido / total_grupo_filtrado,
                }])
            elif len(groupby_usados) == 1:
                atingido = dados[dados['status'].isin(status)].groupby(groupby_usados).size().reset_index(name='atingido')
                if porcentagem_sobre_si:
                    total = dados[dados['status'].isin(list(status_corretos.values()))].groupby(groupby_usados).size().reset_index(name='total')
                    juncao = total.merge(atingido, on=groupby_usados)
                    juncao['quantidade'] = juncao['atingido'] / juncao['total']
                    juncao['periodo_data'] = 'sem_periodo'
                    juncao = juncao[[groupby_usados[0], 'quantidade','periodo_data']].rename(columns={
                        groupby_usados[0]:'nome'
                    })
                    dados = juncao
                else:
                    total = dados[dados['status'].isin(list(status_corretos.values()))].groupby(groupby_usados).size().reset_index(name='total')
                    atingido['total'] = len(dados[dados['status'].isin(list(status_corretos.values()))])
                    dados = atingido
                    dados['quantidade'] = dados['atingido'] / dados['total']
                    dados['periodo_data'] = 'sem_periodo'
                    dados = dados[[groupby_usados[0], 'quantidade', 'periodo_data']].rename(columns={
                        groupby_usados[0]: 'nome'
                    })
            else:
                # pendente - VERIFICAR
                total_grupo_filtrado = dados[dados['status'].isin(status)].groupby(groupby_usados).size().reset_index(name='atingido')
                # Se não for sobre si ele retira o agrupamento do groupby_usados
                if not porcentagem_sobre_si and agrupamento in groupby_usados:
                    groupby_usados.remove(agrupamento)
                # É pra comparar com todos os status ou somente os filtrados?
                if todos_status:
                    total_selecionado = dados[dados['status'].isin(list(status_corretos.values()))].groupby(groupby_usados).size().reset_index(name='total')
                else:
                    total_selecionado = dados[dados['status'].isin(status)].groupby(groupby_usados).size().reset_index(name='total')

                dados = total_grupo_filtrado.merge(total_selecionado, on=groupby_usados)
                # OUTPUT: { agrupamento, periodo_desejado, atingido, total }
                dados['quantidade'] = dados['atingido'] / dados['total']
                dados = dados[[agrupamento, periodo_desejado, 'quantidade']].rename(columns={
                    agrupamento: 'nome',
                    periodo_desejado: 'periodo_data',
                })

                # Devolve o agrupamento para o groupby_usados
                groupby_usados.append(agrupamento)

        # Se o agrupamento for nogroup ele vai criar um atributo novo pra agrupar tudo em um id só
        # ! if agrupamento == 'nogroup':
        #     # Quantas vezes aparece em cada dia.
        #     dados = dados.groupby('dia').size().reset_index(name='quantidade')
        #     # Resultado esperado: { dia, quantidade }
        #     # Ordena por dia
        #     dados = dados.sort_values('dia')

        #     if calculo == 'media_movel':
        #         dados['quantidade'] = dados.groupby(agrupamento)['quantidade'].rolling(window=media_movel_periodos, min_periods=1).mean().reset_index(level=0, drop=True)
        #     elif calculo == 'porcentagem_status':
        #         dados_por_status = dados.groupby(['status','dia']).size().reset_index(name='quantidade_ligacoes')
        #         total_por_dia = dados.groupby('dia').size().reset_index(name='total_do_dia')

        #         dados = total_por_dia.merge(dados_por_status, on='dia')
        #         dados['quantidade'] = dados['quantidade_ligacoes'] / dados['total_do_dia']
        #         # dados = dados.drop(['quantidade','total_do_dia'], axis=1)
        #         dados = dados[ dados['status'].isin(status)]
        #         dados = dados.groupby('dia')['quantidade'].sum().reset_index()
        #     # Cria a coluna 'id_fixo' com o valor Total em todas instâncias.
        #     dados['id_fixo'] = 'Total'
        #     # Defome a variável como o 'id_fixo'
        #     coluna_id = 'id_fixo'
        # else:
        #     # Agrupa pelo que estiver em agrupamento e também por dia.
        #     dados = dados.groupby([agrupamento, 'dia']).size().reset_index(name='quantidade')
        #     dados = dados.sort_values('dia')
        #     if calculo == 'media_movel':
        #         dados['quantidade'] = dados.groupby(agrupamento)['quantidade'].rolling(window=media_movel_periodos, min_periods=1).mean().reset_index(level=0, drop=True)
        #     # Define a coluna a ser o id pelo que estiver em coluna_id.
        # !    coluna_id = agrupamento


        # ! Aqui faz a organização para o NIVO
        # ! Input necessário: {nome (vai ser usado para id), quantidade e dia (periodo) }
        # input_ideal = {
        #     dia: ...,
        #     nome: ...,
        #     quantidade: ...,
        # }



        # dados = dados.rename(columns={
        #     'mes':'periodo_data',
        #     'dia':'periodo_data',
        #     'ano':'periodo_data',
        #     'semana':'periodo_data',
        #     'trimestre':'periodo_data',
        #     'semestre':'periodo_data'
        #     })

        resultado = []
        if modo == 'linechart':
            dados = pd.DataFrame(dados)
            # # # ! Divide o DataFrame pelos valores únicos na coluna escolhida (ex: 'colaborador')
            for nome, grupo in dados.groupby('nome'):
                # Insere em resultado
                resultado.append({
                    "id": nome,  # Ex: "Gabriel Torres"
                    "data": [
                        # Para cada linha do grupo, monta um ponto com a data e quantidade
                        {"x": str(row['periodo_data']), "y": row["quantidade"]} for _, row in grupo.iterrows()
                    ]
                })
            return Response(resultado)

        return Response(dados.to_dict(orient='records'))



class Ligacoes(APIView):
    # Para APIView você deve definir o método, portanto faça um def get ou um def post etc.
    def get(self, request):
        ### Os filtros gerais ficarão aqui
        filtros = {}

        ### Aqui é onde ficará o parâmetro passado no annotate, ou truncmonth ou truncdate
        periodo = {}

        ### Parte responsável pelo filtro de dias habilitados
        # Caso não haja nenhum filtro de dias, todos os dias serão adicionados
        dias_possiveis = request.GET.get('dias', '0,1,2,3,4,5,6') # Sábado é 0 e sexta é 6
        # Se houver algo na variável dias_possiveis, ele irá adicionar todos na lista
        if dias_possiveis:
        # Transforma "2,3,4,5,6" em [2, 3, 4, 5, 6]
        # É um List Comprehension, pois é pego o string, e tratado dentro de uma lista
            dias_possiveis = [int(d) for d in dias_possiveis.split(',') if d.strip().isdigit()]

        # Se houver dias selecionados ele insere isso no dic. de filtros
        if dias_possiveis:
            filtros['dia_da_semana__in'] = dias_possiveis

        ### Parte responsável por filtrar os chamadores
        chamadores = request.GET.get('chamadores') # Virá algo como 'Gabriel Torres, Aline Moreira'
        chamadores = [c.strip() for c in chamadores.split(',')]

        ### Parte responsável pelo modo
        modo = request.GET.get('modo_y','ligacoes_totais') # media_movel || ligacoes_totais
        media_movel_periodos = int(request.GET.get('periodo_media_movel',1))

        ### Parte responsável pelos tipos de periodos
        periodo_desejado = request.GET.get('tipo_periodo', 'dia') # dia ou mes

        if periodo_desejado == 'dia':
            periodo['periodo'] = TruncDate('data_de_contato')
        elif periodo_desejado == 'mes':
            periodo['periodo'] = TruncMonth('data_de_contato')

        ### Parte responsavel por agrupamento por chamador
        agrupa_por_chamador = request.GET.get('agrupamento_por_chamador',False) # bool
        if agrupa_por_chamador:
            # Se tiver algo, e o seu valor está na lista, ele fica true
            agrupa_por_chamador = agrupa_por_chamador.lower() in ['true','1','sim']

        ### Parte para períodos
        periodo_inicial = request.GET.get('inicio','')
        periodo_final = request.GET.get('fim','')
            
        # Adiciona periodo inicial
        if periodo_inicial:
            filtros['periodo__gte'] = periodo_inicial
        # Adiciona periodo final
        if periodo_final:
            filtros['periodo__lte'] = periodo_final

        ### Essa lista define sobre o que será agrupado a resposta toda
        agrupamento_values = ['periodo']

        # Se agrupa_por_chamador for verdadeiro, significa que o usuário quer que agrupe, então adicionar o 'chamador' na lista de agrupamento
        if agrupa_por_chamador:
            agrupamento_values.append('chamador')

######## ! PARTE RESPONSÁVEL POR FILTRAR OS NOMES ERRADOS TODOS
        # Só adicionamos o filtro de 'chamador' se a lista de chamadores não for vazia
        if chamadores:
            # Aqui pega as informações dos colaboradores e só insere um novo atributo = que é a junção de nome com o sobrenome
            # Usando annotate ele adiciona a coluna 'nome_completo'
            colaboradores_queryset = Colaboradores.objects.annotate(
                # Usa a Concat pra juntar 'primeiro_nome' com 'sobrenome' e define a coluna como CharField
                nome_completo=Concat(
                    'primeiro_nome', Value(' '), 'sobrenome', output_field=CharField()
                )
            )
            # Monta um filtro com OR para todos os nomes enviados
            # O reduce vai iterando a função
            # O Q é apenas uma forma de filtrar
            # O or_ é o equivalente a dizer 'ou', é o ||
            # Portanto a função abaixo faz o seguinte, para cada nome que está em chamadores ele verifica se contém em 'nome completo' que é o atributo novo da tabela de colaboradores, que foi criada antes.
            filtro_nomes = reduce(
                # List Comprehension criando uma lista com os nomes, porém adicionando apenas o nome_completo caso esteja em chamadores
                or_, [Q(nome_completo__icontains=nome) for nome in chamadores]
                # RESULTADO ESPERADO: [nome_completo_icontains='Gabriel Torres',nome_completo_icontains='Aline Moreira']
                # Isso garante que teremos uma filtro que pedirá apenas os nomes que tinhamos escolhido
            )

            # Aplica o filtro criado no queryset de colaboradores
            colaboradores = colaboradores_queryset.filter(filtro_nomes)
            # RESULTADO ESPERADO: A entidade inteira de Colaboradores, porém filtrado somente os chamadores solicitados
            # Com os colaboradores em mãos, busca os nomes errados mapeados
            # Isso está olhando lá em alias, pegando tudo que tem nome errado na entidade de ligação
            nomes_errados = ColaboradorEAliasChamador.objects.filter(
                # Aqui é pego os ids dos colaboradores solicitados. Essa lista será usada para pegar todos os nomes errados
                # Aqui já define-se o filtro pegando, no atributo de colaborador_id só os ids dos colaboradores solicitados
                colaborador_id__in=colaboradores.values_list('id', flat=True)
                # RESULTADO ESPERADO: Na entidade de Alias ele filtra só os ids dos Chamadores escolhidos
            ).values_list('nome_errado', flat=True) # Agora, tendo a entidade de Alias filtrada só com os Colaboradores solicitados, faz uma lista com os nomes errados
            # RESULTADO ESPERADO: ['nome_errado1','nome_errado2','nome_errado3'] <= De todos os colaboradores solicitados

            # Agora sim: usa essa lista de nomes errados como filtro nas ligações
            filtros['chamador__in'] = list(nomes_errados)
            # Cria filtro com vários ORs usando Q
            filtro_nomes = reduce(
                or_, [Q(nome_completo__icontains=nome) for nome in chamadores]
            )

            # Aplica filtro ao queryset
            colaboradores = colaboradores_queryset.filter(filtro_nomes)

        # ! Aqui se criam os dados
        dados = (
            ContatosPBX.objects
            .annotate(**periodo,
                dia_da_semana=ExtractWeekDay('data_de_contato'))
            .filter(~Q(quem_recebeu_ligacao='h'))
            .values(*agrupamento_values)
            .annotate(contatos=Count('*'))
            .order_by('-periodo')
            .filter(**filtros)
        )

        # Pega os dados e insere em um DF de Pandas
        df = pd.DataFrame(dados)
        df = df.sort_values(by=['periodo'])  # garante ordem correta

        # Caso o modo seja ligações totais, ele já trará um retorno aqui, sem processar o resto
        if modo == 'ligacoes_totais':
            df = df.rename(columns={'contatos': 'quantidade'})
            # 1. Mapeia nome errado para nome correto
            if agrupa_por_chamador:
                colaborador_map = {
                    alias.nome_errado: f"{alias.colaborador.primeiro_nome} {alias.colaborador.sobrenome}"
                    for alias in ColaboradorEAliasChamador.objects.select_related('colaborador').all()
                }

                # 2. Substitui nomes errados pelo nome correto no DataFrame
                df['colaborador'] = df['chamador'].map(colaborador_map)
                df = df.drop(columns=['chamador'])

                # Agrupa de novo somando os contatos
                df = df.groupby(['periodo', 'colaborador'], as_index=False).sum()

            return Response(df.sort_values(by='periodo', ascending=False).to_dict(orient='records'))

        if agrupa_por_chamador:
            df['media_movel'] = (
                df.groupby('chamador')['contatos']
                .rolling(window=media_movel_periodos, min_periods=1)
                .mean()
                .reset_index(level=0, drop=True)
            )
        else:
            df['media_movel'] = (
                df['contatos']
                .rolling(window=media_movel_periodos, min_periods=1)
                .mean()
            )
        # Ordena resultado final por data decrescente
        df = df.sort_values(by='periodo', ascending=False)
        df = df.replace([np.nan, np.inf, -np.inf], None)

        df = df.drop(columns=['contatos'])
        if agrupa_por_chamador:
            # 1. Mapeia nome errado para nome correto
            colaborador_map = {
                alias.nome_errado: f"{alias.colaborador.primeiro_nome} {alias.colaborador.sobrenome}"
                for alias in ColaboradorEAliasChamador.objects.select_related('colaborador').all()
            }

            # 2. Substitui nomes errados pelo nome correto no DataFrame
            df['colaborador'] = df['chamador'].map(colaborador_map)
            df = df.drop(columns=['chamador'])

        return Response(df.to_dict(orient='records'))
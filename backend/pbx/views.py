from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.db.models.functions import TruncDate, Concat, TruncMonth, TruncTime, ExtractHour, ExtractMinute
from django.http import JsonResponse
from django.db.models import Count, Value, CharField, Q, OuterRef, Subquery, DateField, When, Case, IntegerField
from rest_framework.response import Response
from datetime import date
from django.views import View
from django.db import models
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

    ### Parte para períodos
    dia_inicial = request.GET.get('inicio','')
    dia_final = request.GET.get('fim','')
        
    # Adiciona dia inicial
    if dia_inicial:
        filtros['dia__gte'] = dia_inicial
    # Adiciona periodo final
    if dia_final:
        filtros['dia__lte'] = dia_final

    ### ! Parte responsável por filtrar os chamadores
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
            dia=TruncDate('data_de_contato'),
            horario=TruncTime('data_de_contato'),
            dia_da_semana=ExtractWeekDay('data_de_contato'),
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


class Ligacoes2(APIView):
    def get(self, request):

        agrupamento = [] # Periodo, status, chamador, dia, hora

        ### Parte responsável pelo modo
        modo = request.GET.get('modo_y','ligacoes_totais') # media_movel || ligacoes_totais || variacao
        media_movel_periodos = int(request.GET.get('periodo_media_movel',1))

        ### Parte responsável pelos tipos de periodos
        periodo_desejado = request.GET.get('tipo_periodo', 'dia') # dia ou mes

        # Os dados brutos
        dados = gerar_dataframe_ligacoes(request)

        if agrupamento:
            dados = dados.groupby(agrupamento).size().reset_index(name='quantidade')

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
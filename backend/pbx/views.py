from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.db.models.functions import TruncDate, Concat, TruncMonth
from django.http import JsonResponse
from django.db.models import Count, Value, CharField, Q, OuterRef, Subquery, DateField
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


class Chamadores(APIView):
    # Para APIView você deve definir o método, portanto faça um def get ou um def post etc.
    def get(self, request):
        # Os filtros gerais estão aqui
        filtros = {}
        # Aqui é onde ficará o parâmetro passado no annotate, ou truncmonth ou truncdate
        periodo = {}

        ### Parte responsável pelo filtro de dias habilitados
        dias_possiveis = request.GET.get('dias', '') # Sábado é 0 e sexta é 6
        if dias_possiveis:
        # Transforma "2,3,4,5,6" em [2, 3, 4, 5, 6]
            dias_possiveis = [int(d) for d in dias_possiveis.split(',') if d.strip().isdigit()]
        else:
            # valor padrão se nada for passado
            dias_possiveis = [0, 1, 2, 3, 4, 5, 6]

        ### Parte responsável por filtrar os chamadores
        chamadoresq = request.GET.getlist('chamador')
        if chamadoresq:
            chamadores = chamadoresq
        else: chamadores = ['']

        ### Parte responsável pelo modo
        modo = request.GET.get('modo_y','ligacoes_totais') # media_movel || ligacoes_totais
        media_movel_periodos = int(request.GET.get('periodo_media_movel',1))

        ### Parte responsável pelos tipos de periodos
        periodo_desejado = request.GET.get('tipo_periodo', 'dia') # dia ou mes

        ### Parte responsavel por agrupamento por chamador
        agrupa_por_chamador = request.GET.get('agrupamento_por_chamador',False) # bool

        ### Parte para períodos
        periodo_inicial = request.GET.get('inicio','')
        periodo_final = request.GET.get('fim','')
        agrupamento_values = ['periodo']

        if agrupa_por_chamador:
            agrupamento_values.append('chamador')

        # Se houver dias selecionados ele insere isso no dic. de filtros
        if dias_possiveis:
            filtros['dia_da_semana__in'] = dias_possiveis

        # Só adicionamos o filtro de 'chamador' se a lista de chamadores não for vazia
        if chamadores:
            # 1. Aqui pega as informações dos colaboradores e só insere um novo atributo, juntando o nome com o sobrenome
            colaboradores_queryset = Colaboradores.objects.annotate(
                nome_completo=Concat(
                    'primeiro_nome', Value(' '), 'sobrenome', output_field=CharField()
                )
            )
            # 2. Monta um filtro com OR para todos os nomes enviados
            # O reduce vai iterando a função
            # O Q é apenas uma forma de filtrar
            # O or_ é o equivalente a dizer 'ou', é o ||
            # Portanto a função abaixo faz o seguinte, para cada nome que está em chamadores ele verifica se contém em 'nome completo' que é o atributo novo da tabela de colaboradores, que foi criada antes.
            filtro_nomes = reduce(
                or_, [Q(nome_completo__icontains=nome) for nome in chamadores]
            )

            # 3. Aplica o filtro criado no queryset de colaboradores
            colaboradores = colaboradores_queryset.filter(filtro_nomes)
            # 4. Com os colaboradores em mãos, busca os nomes errados mapeados
            # Isso está olhando lá em alias, pegando tudo que tem nome errado na entidade de ligação
            nomes_errados = ColaboradorEAliasChamador.objects.filter(
                colaborador_id__in=colaboradores.values_list('id', flat=True)
            ).values_list('nome_errado', flat=True)
            # 5. Agora sim: usa esses nomes errados como filtro nas ligações
            filtros['chamador__in'] = list(nomes_errados)
            
        # Adiciona periodo inicial
        if periodo_inicial:
            filtros['periodo__gte'] = periodo_inicial
        # Adiciona periodo final
        if periodo_final:
            filtros['periodo__lte'] = periodo_final

        if periodo_desejado == 'dia':
            periodo['periodo'] = TruncDate('data_de_contato')
        elif periodo_desejado == 'mes':
            periodo['periodo'] = TruncMonth('data_de_contato')

        if chamadores:
            # Junta primeiro_nome + sobrenome como "nome_completo"
            colaboradores_queryset = Colaboradores.objects.annotate(
                nome_completo=Concat(
                    'primeiro_nome', Value(' '), 'sobrenome', output_field=CharField()
                )
            )
            # Cria filtro com vários ORs usando Q
            filtro_nomes = reduce(
                or_, [Q(nome_completo__icontains=nome) for nome in chamadores]
            )

            # Aplica filtro ao queryset
            colaboradores = colaboradores_queryset.filter(filtro_nomes)

        dados = (
            ContatosPBX.objects
            .annotate(**periodo,
                dia_da_semana=ExtractWeekDay('data_de_contato'))
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
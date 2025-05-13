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

from .models import ContatosPBX, ColaboradorEAliasChamador
from empresa.models import Colaboradores

# View que mostra todas os contatos feitos
class ListaContatos(ListAPIView):
    queryset = ContatosPBX.objects.all()
    serializer_class = ContatosPBXSerializer


class Chamadores(APIView):
    # Para APIView você deve definir o método, portanto faça um def get ou um def post etc.
    def get(self, request):
        filtros = {}
        periodo = {}
        media_movel_periodos = 5
        dias_possiveis = [2,3,4,5,6] # Sábado é 0 e sexta é 6
        chamadores = ['Suelen_Lidoni']
        modo = 'ligacoes_totais' # media_movel || ligacoes_totais
        periodo_desejado = 'dia'

        # Se houver dias selecionados ele insere isso no dic. de filtros
        if dias_possiveis:
            filtros['dia_da_semana__in'] = dias_possiveis
        # Só adicionamos o filtro de 'chamador' se a lista de chamadores não for vazia
        if chamadores:
            filtros['chamador__in'] = chamadores

        if periodo_desejado == 'dia':
            periodo['periodo'] = TruncDate('data_de_contato')
        elif periodo_desejado == 'mes':
            periodo['periodo'] = TruncMonth('data_de_contato')

        dados = (
            ContatosPBX.objects
            .annotate(**periodo,
                dia_da_semana=ExtractWeekDay('data_de_contato'))
            .values('chamador','periodo')
            .annotate(contatos=Count('*'))
            .order_by('-periodo')
            .filter(**filtros)
        )

        # Pega os dados e insere em um DF de Pandas
        df = pd.DataFrame(dados)
        df = df.sort_values(by=['chamador', 'periodo'])  # garante ordem correta

        if modo == 'ligacoes_totais':
            df = df.rename(columns={'contatos': 'quantidade'})
            return Response(df.sort_values(by='periodo', ascending=False).to_dict(orient='records'))

        df['media_movel'] = (

            df.groupby('chamador')['contatos']
            .rolling(window=media_movel_periodos, min_periods=1)
            .mean()
            .reset_index(level=0, drop=True)
        )
        # Ordena resultado final por data decrescente
        df = df.sort_values(by='periodo', ascending=False)
        df = df.replace([np.nan, np.inf, -np.inf], None)

        df = df.drop(columns=['contatos'])
        return Response(df.to_dict(orient='records'))
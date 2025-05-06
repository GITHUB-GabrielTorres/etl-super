from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.db.models.functions import TruncDate
from django.db.models import Count, Value, CharField, Q
from rest_framework.response import Response
from datetime import date

from .serializers import ContatosPBXSerializer
from .models import ContatosPBX


class ListaContatos(ListAPIView):
    queryset = ContatosPBX.objects.all()
    serializer_class = ContatosPBXSerializer

# Isso é o que recebe a URL GET. Aqui se tratam os querysets, por exemplo.
class LigacoesPorDiaView(APIView):
    def get(self, request):
        data_inicio = request.GET.get('data_inicio')
        data_fim = request.GET.get('data_fim')
        chamadores = request.GET.getlist('chamador')

        queryset = ContatosPBX.objects.all()

        if chamadores:
            queryset = queryset.filter(chamador__in=chamadores)

        if data_inicio and data_fim:
            queryset = queryset.filter(data_de_contato__date__range=[data_inicio, data_fim])

        if data_inicio and not data_fim:
            data_fim = date.today()
            queryset = queryset.filter(data_de_contato__date__range=[data_inicio, data_fim])

        dados = (
            queryset
            .annotate(dia=TruncDate('data_de_contato'))  # Agrupa a data (sem hora)
            .values('dia')
            .annotate(
                quantidade=Count('codigo_unico'),
                quantidade_answered=Count('codigo_unico', filter=Q(status='ANSWERED'))
                )  # Conta quantos registros por dia
            .order_by('-dia')
        )
        return Response(list(dados))
    
class ListaChamadores(APIView):
    def get(self, request):
        nomes = ContatosPBX.objects.order_by().values_list('chamador', flat=True).distinct()
        return Response(nomes)
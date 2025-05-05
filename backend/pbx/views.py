from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.db.models.functions import TruncDate
from django.db.models import Count
from rest_framework.response import Response

from .serializers import ContatosPBXSerializer
from .models import ContatosPBX


class ListaContatos(ListAPIView):
    queryset = ContatosPBX.objects.all()
    serializer_class = ContatosPBXSerializer

class LigacoesPorDiaView(APIView):
    def get(self, request):
        dados = (
            ContatosPBX.objects
            .annotate(dia=TruncDate('data_de_contato'))  # Agrupa a data (sem hora)
            .values('dia')
            .annotate(quantidade=Count('codigo_unico'))  # Conta quantos registros por dia
            .order_by('-dia')
        )
        return Response(list(dados))
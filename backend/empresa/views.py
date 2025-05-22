from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Colaboradores
from .serializers import ColaboradoresSerializer
class ColaboradoresView(APIView):
    def get(self, request):

        somenteAtivos = request.GET.get('ativo', False)
        if somenteAtivos:
            somenteAtivos = somenteAtivos.lower() in ['true', '1', 'sim']

        queryset = Colaboradores.objects.all()

        if somenteAtivos:
            queryset = queryset.filter(ativo = True)

        serializer = ColaboradoresSerializer(queryset, many=True)

        return Response(serializer.data)
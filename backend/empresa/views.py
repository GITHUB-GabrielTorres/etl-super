from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Colaboradores
from .serializers import ColaboradoresSerializer
class ColaboradoresView(APIView):
    def get(self, request):
        queryset = Colaboradores.objects.all()
        serializer = ColaboradoresSerializer(queryset, many=True)
        return Response(serializer.data)
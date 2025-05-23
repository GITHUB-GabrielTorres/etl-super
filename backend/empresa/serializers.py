from rest_framework import serializers

from .models import Colaboradores

class ColaboradoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colaboradores
        fields = '__all__'
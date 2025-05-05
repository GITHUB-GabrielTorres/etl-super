from rest_framework import serializers
from .models import ContatosPBX

class ContatosPBXSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContatosPBX
        fields = '__all__'
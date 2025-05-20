from django.urls import path
from .views import ListaContatos, Chamadores

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('ligacoes/', Chamadores.as_view(), name="ligacoes"),
]
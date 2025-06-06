from django.urls import path
from .views import ListaContatos, Ligacoes, Ligacoes2, DadosCrus

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('ligacoes/', Ligacoes.as_view(), name="ligacoes"),
    path('ligacoes2/', Ligacoes2.as_view(), name="ligacoes2"),
    path('dadoscrus/', DadosCrus.as_view(), name="allDataFromFunction"),
]
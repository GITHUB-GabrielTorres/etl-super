from django.urls import path
from .views import ListaContatos, Ligacoes2, DadosBrutos

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('ligacoes2/', Ligacoes2.as_view(), name="ligacoes2"),
    path('ligacoesbrutas/', DadosBrutos.as_view(), name='ligacoes brutas')
]
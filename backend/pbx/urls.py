from django.urls import path
from .views import ListaContatos, LigacoesPorDiaView, ListaChamadores, ligacoes_por_colaborador_por_dia

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('contatos-dia/', LigacoesPorDiaView.as_view(), name="list-contatos-por-dia"),
    path('chamadores/', ListaChamadores.as_view(), name="list-chamadores"),
    path("ligacoes-por-colaborador/", ligacoes_por_colaborador_por_dia)
]
from django.urls import path
from .views import ListaContatos, LigacoesPorDiaView, ListaChamadores

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('contatos-dia/', LigacoesPorDiaView.as_view(), name="list-contatos-por-dia"),
    path('chamadores/', ListaChamadores.as_view(), name="list-chamadores"),
]
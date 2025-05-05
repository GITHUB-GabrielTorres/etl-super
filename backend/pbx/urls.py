from django.urls import path
from .views import ListaContatos, LigacoesPorDiaView

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('contatos-dia/', LigacoesPorDiaView.as_view(), name="list-contatos-por-dia"),
]
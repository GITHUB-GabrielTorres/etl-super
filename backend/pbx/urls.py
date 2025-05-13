from django.urls import path
from .views import ListaContatos, Chamadores

urlpatterns = [
    path('contatos/', ListaContatos.as_view(), name="list-contatos"),
    path('chamadores/', Chamadores.as_view(), name="list-chamadores"),
]
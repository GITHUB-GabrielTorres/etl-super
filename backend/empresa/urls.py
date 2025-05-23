from django.urls import path

from .views import ColaboradoresView

urlpatterns = [
    path('colaboradores/', ColaboradoresView.as_view(), name="lista_colaboradores"),
]
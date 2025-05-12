from django.db import models


class Colaboradores(models.Model):
    primeiro_nome = models.CharField(max_length=250)
    sobrenome = models.CharField(max_length=250)
    ativo = models.BooleanField()

    def __str__(self):
        return f'{self.primeiro_nome} {self.sobrenome}'

class Setores(models.Model):
    nome = models.CharField(max_length=250)

    def __str__(self):
        return self.nome
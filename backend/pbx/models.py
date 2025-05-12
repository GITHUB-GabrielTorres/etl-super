from django.db import models

from empresa.models import Setores
from empresa.models import Colaboradores

class ContatosPBX(models.Model):

    codigo_unico = models.CharField(max_length=250, primary_key=True)
    protocolo = models.CharField(max_length=150)
    data_de_contato = models.DateTimeField(null=True, blank=True, db_index=True)
    quem_ligou = models.CharField(max_length=150, null=True, blank=True)
    quem_recebeu_ligacao = models.CharField(max_length=150, null=True, blank=True)
    grupo_discagem_saida = models.CharField(max_length=150, null=True, blank=True)
    duracao_em_segundos = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=150, null=True, blank=True)
    nome_do_tronco = models.CharField(max_length=150, null=True, blank=True)
    chamador = models.CharField(max_length=150, null=True, blank=True)

    def __str__(self):
        return f"{self.protocolo} - {self.data_de_contato}"
    class Meta:
        verbose_name = "Contato PBX"
        verbose_name_plural = "Contatos PBX"
        ordering = ['-data_de_contato']

class SetorChamadorHistorico(models.Model):
    setor = models.ForeignKey(Setores, on_delete=models.PROTECT)
    chamador = models.ForeignKey(Colaboradores, on_delete=models.PROTECT)
    data_de_inicio = models.DateField()
    data_de_saida = models.DateField(null=True, blank=True)

class ColaboradorEAliasChamador(models.Model):
    nome_errado = models.CharField(max_length=250)
    colaborador = models.ForeignKey(Colaboradores, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.colaborador} - {self.nome_errado}'
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["nome_errado"], name="unique_nome_errado")
        ]
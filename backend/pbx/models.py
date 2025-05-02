from django.db import models

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
    gravacao = models.CharField(max_length=150, null=True, blank=True)
    chamador = models.CharField(max_length=150, null=True, blank=True)

    def __str__(self):
        return f"{self.protocolo} - {self.data_de_contato}"
    class Meta:
        verbose_name = "Contato PBX"
        verbose_name_plural = "Contatos PBX"
        ordering = ['-data_de_contato']
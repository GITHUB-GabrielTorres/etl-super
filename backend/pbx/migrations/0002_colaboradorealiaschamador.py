# Generated by Django 5.2 on 2025-05-12 14:47

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pbx', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ColaboradorEAliasChamador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome_errado', models.CharField(max_length=250)),
                ('colaborador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='empresa.colaboradores')),
            ],
        ),
    ]

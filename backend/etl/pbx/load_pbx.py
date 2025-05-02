import os
import sys

from run import processar_dados_pbx_cdr

df_tratado = processar_dados_pbx_cdr()

# Caminho até a pasta onde está manage.py
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)

# Nome correto do módulo settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

# Agora carrega o Django
import django
django.setup()

print("Django carregado com sucesso")
print(df_tratado.head())

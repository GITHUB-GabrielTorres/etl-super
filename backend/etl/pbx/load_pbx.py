import os
import sys

# Caminho até a pasta onde está manage.py
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)

# Nome correto do módulo settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

# Agora carrega o Django
import django
django.setup()

# Importações do projeto
from pbx.models import ContatosPBX
from django.conf import settings
from psycopg2 import connect
from psycopg2.extras import execute_values


def carregamento_dos_dados(df_tratado):

    # Puxa as colunas do models ContatosPBX
    pbx_cdr_columns = [field.name for field in ContatosPBX._meta.fields]

    # Gera as tuplas respeitando a ordem das colunas
    values = [tuple(row[col] for col in pbx_cdr_columns) for _, row in df_tratado.iterrows()]

    # ===== Inserção no PostgreSQL =====

    def get_postgres_connection():
        db = settings.DATABASES['default']
        return connect(
            dbname=db['NAME'],
            user=db['USER'],
            password=db['PASSWORD'],
            host=db['HOST'],
            port=db.get('PORT', 5432)
        )

    # Define a tabela de destino e a query
    table_name = 'pbx_contatospbx'
    columns_sql = ', '.join(pbx_cdr_columns)
    on_conflict = 'codigo_unico'

    query = f"""
        INSERT INTO {table_name} ({columns_sql})
        VALUES %s
        ON CONFLICT ({on_conflict}) DO NOTHING;
    """

    # Executa o insert
    try:
        with get_postgres_connection() as conn:
            with conn.cursor() as cur:
                execute_values(cur, query, values)
            conn.commit()
        print("Registros salvos com sucesso.")
    except Exception as e:
        print("Erro ao salvar:", e)

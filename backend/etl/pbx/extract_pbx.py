# backend/etl/pbx/extract.py

import pandas as pd
from sqlalchemy import create_engine
import sys
import os
from psycopg2 import connect
from django.conf import settings
import django
from db_config import MARIADB_PBX_CONFIG
from datetime import timedelta


# Define o caminho da raiz do projeto e configura o Django
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")
django.setup()

def get_ultima_data_contato():
    """
    Busca a maior data_de_contato da tabela destino que tá em Postgre, é a pbx_contatospbx
    """
    db = settings.DATABASES['default']
    conn = connect(
        dbname=db['NAME'],
        user=db['USER'],
        password=db['PASSWORD'],
        host=db['HOST'],
        port=db.get('PORT', 5432),
    )

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT MAX(data_de_contato) FROM pbx_contatospbx;")
            result = cur.fetchone()[0]
            # Essa diferença se dá em relação à última datetime de ligação existente atualmente, e não em relação a agora.
            result -= timedelta(hours=5)
            print(result)
            return result  # datetime ou None
    finally:
        conn.close()

data_maxima_atual = get_ultima_data_contato()


def extract_cdr_data():
    try:
        # Monta a URL de conexão com o MariaDB
        connection_url = (
            f"mysql+pymysql://{MARIADB_PBX_CONFIG['user']}:{MARIADB_PBX_CONFIG['password']}"
            f"@{MARIADB_PBX_CONFIG['host']}:{MARIADB_PBX_CONFIG['port']}/{MARIADB_PBX_CONFIG['database']}"
        )

        # Cria o engine com SQLAlchemy
        engine = create_engine(connection_url)

        # Consulta SQL
        query = f"""
            SELECT DISTINCT
                protocolo,
                calldate,
                clid,
                callerid,
                dst,
                dcontext,
                duration,
                disposition,
                trunkout
            FROM cdr
            WHERE protocolo <> ''
        """
        if data_maxima_atual:   
            query += f" AND calldate >= '{data_maxima_atual}'"

        # Extrai os dados para um DataFrame
        df = pd.read_sql(query, engine)

        # print(f"[EXTRACT] {len(df)} registros extraídos da tabela cdr.")
        # print(df.head())
        return df

    except Exception as e:
        print(f"[ERRO] Falha ao extrair dados: {e}")
        return None
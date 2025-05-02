# backend/etl/pbx/extract.py

import pandas as pd
from sqlalchemy import create_engine
import sys
import os
from db_config import MARIADB_PBX_CONFIG

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
        query = """
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
            WHERE protocolo <> '';
        """

        # Extrai os dados para um DataFrame
        df = pd.read_sql(query, engine)

        # print(f"[EXTRACT] {len(df)} registros extraídos da tabela cdr.")
        # print(df.head())
        return df

    except Exception as e:
        print(f"[ERRO] Falha ao extrair dados: {e}")
        return None
# backend/etl/pbx/db_config.py

# Configuração para extração de dados do MariaDB (fonte)
MARIADB_PBX_CONFIG = {
    "host": "95.111.235.139",           # IP ou domínio do servidor MariaDB
    "port": 3306,                  # Porta padrão do MariaDB
    "user": "bi",         # Nome do usuário com acesso ao banco
    "password": "Syngoo%402025",    # Senha do usuário
    "database": "lispbx"           # Nome do banco de dados de origem
}

# Configuração para carregamento de dados no PostgreSQL do Django (destino)
# Se estiver usando o mesmo banco do settings.py do Django, pode deixar isso como ponte.
POSTGRES_DJANGO_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "user": "postgres",
    "password": "senha_postgres",
    "database": "etl_dashboard"
}

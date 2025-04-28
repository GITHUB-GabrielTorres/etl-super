import pandas as pd


def remove_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Aplica as transformações necessárias no dataframe."""
    
    df = df.drop(columns=['tipo_agente','agente', 'ddr', 'cod_perfil', 'src', 'agente_src', 'captura_dst', 'agente_dst', 'captura_agente_dst', 'channel', 'dstchannel', 'lastdata', 'amaflags', 'hang_tech', 'hang_ast'])
    
    # Remover espaços em branco nos nomes das colunas
    # df.columns = df.columns.str.upper()

    # # Padronizar string: tirar espaços, colocar minúsculo
    # if 'nome' in df.columns:
    #     df['nome'] = df['nome'].str.strip().str.lower()

    # # Corrigir formatos de data
    # if 'data' in df.columns:
    #     df['data'] = pd.to_datetime(df['data'], errors='coerce')

    # # Preencher valores nulos
    # df.fillna({
    #     'idade': 0,
    #     'nome': 'desconhecido',
    #     'ddr': 'NA'
    # }, inplace=True)

    return df


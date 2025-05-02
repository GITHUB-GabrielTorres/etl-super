import pandas as pd

from extract_pbx import extract_cdr_data
from transform_pbx import remove_columns, extract_name, remove_values

""" Execução do Processo de ETL com a entidade CDR do PBX """
def processar_dados_pbx_cdr():
    
    # Extração dos dados cdr do PBX
    df = extract_cdr_data()
    print('Extração feita.')
    """ TRATAMENTO DOS DADOS """
    # # Remove useless columns
    # useless_cols = ['tipo_agente','agente', 'ddr', 'cod_perfil', 'src', 'agente_src', 'captura_dst', 'agente_dst', 'captura_agente_dst', 'channel', 'dstchannel', 'lastdata', 'amaflags', 'hang_tech', 'hang_ast', 'uradigito','hang_code','linkedid','sequence','accountcode','peeraccount','uniqueid','userfield','trunkin','billsec','lastapp','tipo_agente', 'monitor']
    # df_with_no_useless_cols = remove_columns(df, useless_cols)
    # print('Deleção de colunas inúteis feita.')

    # Extract the name on clid and puts on a new column called 'chamador'
    df['chamador'] = df['clid'].apply(extract_name)
    print('Extração do nome em "clid" feita e inserida em uma nova coluna chamada "chamador".')

    # Remove the column 'clid'
    df = remove_columns(df, ['clid'])
    print('Deleção da coluna que se tornou obsoleta "clid".')

    # Setting new names to the columns
    df_new_columns_names = df.rename(columns={
        'calldate':'data_de_contato',
        'callerid':'quem_ligou',
        'dst':'quem_recebeu_ligacao',
        'dcontext':'grupo_discagem_saida',
        'duration':'duracao_em_segundos',
        'disposition':'status',
        'trunkout':'nome_do_tronco',
        'monitor':'gravacao'
    })
    print('Nomes das colunas alterados.')

    # # Remove em Protocolo o que for vazio
    # df_no_empty_protocol = remove_values(df_new_columns_names, 'protocolo', [''])
    # print('Remoção dos registros sem protocolo.')

    # # Remove os duplicados (caso todas colunas tenham os mesmos valores)
    # df_no_duplicates = df_no_empty_protocol.drop_duplicates(keep='first').copy()
    # print('Remoção dos registros idênticos duplicados, deixando apenas o primeiro.')

    # Insere uma PK unindo Protocolo, Data de contato e Status
    df_new_columns_names['codigo_unico'] = df_new_columns_names[['protocolo', 'data_de_contato', 'status']].astype(str).agg('_'.join, axis=1)
    print('Inserção de uma coluna nova, "codigo_unico" que servirá de PK.')

    return df_new_columns_names

# Executa o processo de transformação dos dados
df_tratado = processar_dados_pbx_cdr()

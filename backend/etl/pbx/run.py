import pandas as pd

from extract_pbx import extract_cdr_data
from transform_pbx import remove_columns, extract_name, remove_values

# Extrair
df = extract_cdr_data()

""" TRATAMENTO DOS DADOS """
# Remove useless columns
useless_cols = ['tipo_agente','agente', 'ddr', 'cod_perfil', 'src', 'agente_src', 'captura_dst', 'agente_dst', 'captura_agente_dst', 'channel', 'dstchannel', 'lastdata', 'amaflags', 'hang_tech', 'hang_ast', 'uradigito','hang_code','linkedid','sequence','accountcode','peeraccount','uniqueid','userfield','trunkin','billsec','lastapp','tipo_agente']
df_with_no_useless_cols = remove_columns(df, useless_cols)

# Extract the name on clid and puts on a new column called 'chamador'
df_with_no_useless_cols['chamador'] = df_with_no_useless_cols['clid'].apply(extract_name)

# Remove the column 'clid'
df_with_no_useless_cols = remove_columns(df_with_no_useless_cols, ['clid'])

# Setting new names to the columns
df_new_columns_names = df_with_no_useless_cols.rename(columns={
    'calldate':'data_de_contato',
    'callerid':'quem_ligou',
    'dst':'quem_recebeu_ligacao',
    'dcontext':'grupo_discagem_saida',
    'duration':'duracao_em_segundos',
    'disposition':'status',
    'trunkout':'nome_do_tronco',
    'monitor':'gravacao'
})

# Remove em Protocolo o que for vazio
df = remove_values(df_new_columns_names, 'protocolo', [''])

print(df)
# print(df_clean.info())

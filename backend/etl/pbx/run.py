import pandas as pd

from extract_pbx import extract_cdr_data
from transform_pbx import remove_columns

# Extrair
df = extract_cdr_data()

""" TRATAMENTO DOS DADOS """
# Remove useless columns
useless_cols = ['tipo_agente','agente', 'ddr', 'cod_perfil', 'src', 'agente_src', 'captura_dst', 'agente_dst', 'captura_agente_dst', 'channel', 'dstchannel', 'lastdata', 'amaflags', 'hang_tech', 'hang_ast', 'uradigito','hang_code','linkedid','sequence','accountcode','peeraccount','uniqueid','userfield','trunkin','billsec','lastapp','tipo_agente']
df_with_no_useless_cols = remove_columns(df, useless_cols)


print(df_with_no_useless_cols.info())
# print(df_clean.info())

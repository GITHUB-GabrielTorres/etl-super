import pandas as pd

from extract_pbx import extract_cdr_data
from transform_pbx import remove_columns

# Extrair
df = extract_cdr_data()

# Transformar
df_clean = remove_columns(df)

print(df_clean)
# print(df_clean.info())

import pandas as pd
import re

def remove_columns(df: pd.DataFrame, columns_to_delete) -> pd.DataFrame:
    """Aplica as transformações necessárias no dataframe."""
    
    df = df.drop(columns=columns_to_delete)

    return df

def extract_name(item):
    match = re.search(r'"([^"]+)"', item)

    if match:
        resultado = match.group(1)
        if resultado.isdigit():
            resultado = ""
        return resultado

def remove_values(df: pd.DataFrame, column_name: str, items_to_remove: list) -> pd.DataFrame:
    return df[~df[column_name].isin(items_to_remove)]

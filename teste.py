
dias_possiveis = '1,2,3   , 6, a,126'

dias_possiveis_tratado = [int(d) for d in dias_possiveis.split(',') if d.strip().isdigit() and (int(d) % 2) == 0]

print(dias_possiveis_tratado)
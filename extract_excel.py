import pandas as pd
with open('docs_output.txt', 'w', encoding='utf-8') as f:
    df = pd.read_excel('docs/QuanLyBanHang_EPIC 1.xlsx', sheet_name=None)
    for k, v in df.items():
        f.write(f'\n--- Sheet: {k} ---\n')
        f.write(v.to_string())

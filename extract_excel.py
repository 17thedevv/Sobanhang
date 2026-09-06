import pandas as pd
import sys

excel_file = "docs/QuanLyBanHang_Phase2.xlsx"
out_file = "docs/QuanLyBanHang_Phase2_Extracted.md"

try:
    xls = pd.ExcelFile(excel_file)
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("# Tóm tắt Nghiệp vụ - Phase 2\n\n")
        
        for sheet in xls.sheet_names:
            f.write(f"## Sheet: {sheet}\n")
            df = pd.read_excel(xls, sheet_name=sheet)
            # convert to markdown table
            f.write(df.to_markdown(index=False))
            f.write("\n\n---\n\n")
            
    print(f"Successfully extracted to {out_file}")
except Exception as e:
    print(f"Error: {e}")

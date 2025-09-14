import pandas as pd
import json

file_path = "kb/burmese_kb.json"

with open(file_path, 'rt', encoding='utf-8') as f_out:
    json_data = json.load(f_out)

i = 0
str_total = ""
for d in json_data:
    str_total += f"id: {i+1} {d['text']}'\n'"
    i += 1
print(str_total)
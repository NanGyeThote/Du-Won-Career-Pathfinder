import json 

with open('data/raw/processed_job.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for dco in data:
    count+=1

print(f"Count: {count}") #1944

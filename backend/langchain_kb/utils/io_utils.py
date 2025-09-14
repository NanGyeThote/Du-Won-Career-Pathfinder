import json

def load_kb(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                return []
            else:
                return json.loads(content)
    except FileNotFoundError:
        return []

def load_corpus(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                return {}
            else:
                return json.loads(content)
    except FileNotFoundError:
        return {}

def save_kb(path, kb):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(kb, f, indent=2, ensure_ascii=False)

def save_chunks(path, kb):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(kb, f, indent=2, ensure_ascii=False)

import sys
#from expand.wiki_expander import expand_job_to_kb
from expand.wiki_expander_2 import expand_job_to_kb
from embed.embedder import embed_and_store
from utils.io_utils import load_kb, save_kb, save_chunks, load_corpus

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <job_title>")
        return

    job_title = sys.argv[1]
    print(f"Expanding KB for job: {job_title}")

    # Load existing KB
    kb = load_kb("kb/new_db.json")

    # Get new expanded docs
    chunks_dict, new_docs = expand_job_to_kb(job_title)
    print("Generated new KB chunks.")

    # Append new docs to KB (doesn't avoid duplicate, raw input)
    kb.extend(new_docs)

    # Save updated KB
    save_kb("kb/new_db.json", kb)
    print("Saved updated KB.")

    # Load Corpus.txt
    raw_corpus = load_corpus('kb/raw_corpus.txt')
    #print(raw_corpus) # -> For testing Purpose

    # Append new data
    raw_corpus.update(chunks_dict)
    #print(chunks_dict)
    #print(raw_corpus)

    # Save Corpus
    save_chunks('kb/raw_corpus.txt', raw_corpus)
    print(f"Saved Updated Corpus.")

    # Embed and store to vector DB
    #embed_and_store(new_docs)
    #print("Embedded and stored new docs in vector DB.")

if __name__ == "__main__":
    main()

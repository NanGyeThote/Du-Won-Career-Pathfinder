import sys
import json
from embed.embedder import embed_and_store
from langchain.docstore.document import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

def main():
    # Define the path to your dataset
    file_path = './ground_truth/processed_job.json'
    print(f"Loading and processing data from: {file_path}")

    try:
        # Load the JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            job_data = json.load(f)
        if not job_data:
            raise ValueError("JSON file loaded is empty.")
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return
    except ValueError as e:
        print(f"Error: {e}")
        return
    
    # --- Prepare documents for embedding ---
    all_documents = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )
    
    # Iterate through the list of dictionaries in your JSON file
    for entry in job_data:
        text_to_chunk = entry['unified_document']
        chunks = text_splitter.split_text(text_to_chunk)
        for chunk in chunks:
            metadata = {
                "job_title": entry['job_title'],
                "original_id": entry['job_id']
            }
            doc = Document(page_content=chunk, metadata=metadata)
            all_documents.append(doc)
    
    print(f"Total documents prepared for embedding: {len(all_documents)}")
    print("-" * 50)

    # --- Embed and store to vector DB ---
    embed_and_store(all_documents)
    print("Embedded and stored all documents in the vector DB.")

if __name__ == "__main__":
    main()

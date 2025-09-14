import os
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings # pyright: ignore[reportMissingImports]
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
import pandas as pd

# Define the persistence directory for your database
persist_directory = "./all_min_chromadb"

# --- Step 1: Load or Create the ChromaDB Vector Store ---
embedding_function = OllamaEmbeddings(model="all-minilm:l6-v2")

def save_chunks_to_file(documents, output_file="./data/chunks-data.txt"):
    """
    Saves the content of documents to a text file.

    Args:
        documents (list): A list of Document objects.
        output_file (str): The path to the output text file.
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        for doc in documents:
            f.write(f"--- Chunk from job: {doc.metadata.get('job_title', 'N/A')} ---\n")
            f.write(doc.page_content)
            f.write("\n\n")
    print(f"Successfully saved {len(documents)} chunks to {output_file}")

# Check if the database already exists
if os.path.exists(persist_directory) and os.listdir(persist_directory):
    # If the directory exists and is not empty, load the existing vector store
    print("Loading existing ChromaDB vector store...")
    vectordb = Chroma(
        persist_directory=persist_directory,
        embedding_function=embedding_function
    )
    print(f"Successfully loaded a ChromaDB vector store with {vectordb._collection.count()} documents.")
else:
    # If the directory doesn't exist or is empty, create a new one
    print("No existing ChromaDB found. Creating a new vector store...")
    # --- Load and Create Document Chunks from the JSON file ---
    file_path = './ground_truth/processed_job.json'
    try:
        df = pd.read_json(file_path)
        if df.empty:
            raise ValueError("DataFrame loaded from JSON is empty.")
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        exit()
    except ValueError as e:
        print(f"Error: {e}")
        exit()

    all_documents = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""]
    )

    for index, row in df.iterrows():
        text_to_chunk = row['unified_document']
        chunks = text_splitter.split_text(text_to_chunk)
        for chunk in chunks:
            metadata = {
                "job_title": row['job_title'],
                "original_index": index
            }
            doc = Document(page_content=chunk, metadata=metadata)
            all_documents.append(doc)
    
    print(f"Total documents prepared for embedding: {len(all_documents)}")

    # Embed and store the documents for the first time
    vectordb = Chroma.from_documents(
        documents=all_documents,
        embedding=embedding_function,
        persist_directory=persist_directory
    )
    print(f"Successfully created a new ChromaDB vector store with {vectordb._collection.count()} documents.")

print("-" * 50)

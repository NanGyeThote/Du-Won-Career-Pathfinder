import pandas as pd
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# --- Step 1: Load and Process Data ---
file_path = './ground_truth/processed_job.json'

# Use pd.read_json() to correctly read the JSON file into a DataFrame
df = pd.read_json(file_path)

# --- Step 2: Create Document Chunks and the 'all_documents' list ---
all_documents = []

# Initialize the text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", " ", ""]
)

# Iterate through each row to create document chunks and add metadata
for index, row in df.iterrows():
    # Use the unified document we just created
    text_to_chunk = row['unified_document']

    # Split the text into chunks
    chunks = text_splitter.split_text(text_to_chunk)

    # Create LangChain Document objects for each chunk
    for chunk in chunks:
        metadata = {
            "job_title": row['job_title'],
            "original_index": index
        }
        doc = Document(page_content=chunk, metadata=metadata)
        all_documents.append(doc)

# --- Step 3: Use the 'all_documents' list ---
# Now you can use the 'all_documents' variable in the rest of your pipeline
texts_to_embed = [doc.page_content for doc in all_documents]

print(f"Total chunks to embed: {len(texts_to_embed)}")
print(f"Example chunk: {texts_to_embed[0]}")
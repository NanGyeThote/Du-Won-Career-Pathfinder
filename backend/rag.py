import os
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
import pandas as pd
import json

# Define the directory where your vector database will be saved
persist_directory = "./all_min_chromadb"

# --- Conditionally load or create the vector store ---
if os.path.exists(persist_directory) and os.listdir(persist_directory):
    print("Loading existing ChromaDB vector store...")
    embedding_function = OllamaEmbeddings(model="all-minilm:l6-v2")
    vectordb = Chroma(persist_directory=persist_directory, embedding_function=embedding_function)
    print("ChromaDB vector store loaded successfully.")
else:
    print("No existing vector store found. Creating and embedding data...")
    file_path = './ground_truth/processed_job.json'
    try:
        df = pd.read_json(file_path)
        if df.empty:
            raise ValueError("DataFrame loaded from JSON is empty.")
    except (FileNotFoundError, ValueError) as e:
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
            metadata = {"job_title": row['job_title'], "original_index": index}
            doc = Document(page_content=chunk, metadata=metadata)
            all_documents.append(doc)

    print(f"Total documents prepared for embedding: {len(all_documents)}")
    embedding_function = OllamaEmbeddings(model="all-minilm:l6-v2")
    vectordb = Chroma.from_documents(
        documents=all_documents,
        embedding=embedding_function,
        persist_directory=persist_directory
    )
    vectordb.persist()
    print(f"Successfully created and persisted a ChromaDB vector store with {vectordb._collection.count()} documents.")

print("-" * 50)
print("Vector store is ready. You can now perform searches and run the RAG chain.")
print("-" * 50)

# --- Step 3: Set up the RAG Chain with Ollama LLM ---
local_llm = OllamaLLM(model="mistral")

retriever = vectordb.as_retriever()

prompt_template = """
You are a career recommendation assistant. Your goal is to provide clear, concise, and 
well-structured answers based on the user's query and the provided context. 

**Instructions for Formatting:**
- Analyze the user's question, which may contain information from their CV or quiz answers.
- Use the provided "Context" (which contains information about job descriptions and skills) to formulate your recommendations.
- **Do NOT repeat or include the user's CV details or quiz answers in your response.**
- Your response should be a recommendation, not a summary of the information provided by the user.
- Use bullet points or numbered lists for recommendations, steps, or lists of skills.
- Keep sentences clear and to the point.
- Structure your response in a way that is easy to read.

If you don't know the answer or the context is not sufficient, just say that you don't know, don't try to make up an answer.

**Context:**
{context}

**User's Query:**
Question: {question}

**Your Recommendation:**
Answer:
"""
PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

# --- The crucial change is here: add document_variable_name ---
qa_chain = RetrievalQA.from_chain_type(
    llm=local_llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT, "document_variable_name": "context"}
)
print("RAG chain with Ollama is ready. You can now run a query.")
print("-" * 50)

# --- Step 4: Run a Query ---
query = "What skills are required for a ML Engineer and what is the learning path?"
result = qa_chain.invoke({"query": query})

print(f"Query: {query}\n")
print(f"Answer: {result['result']}\n")
print("--- Source Documents ---")
for doc in result['source_documents']:
    print(f"Job Title: {doc.metadata['job_title']}")
    print(f"Chunk: {doc.page_content[:150]}...\n")
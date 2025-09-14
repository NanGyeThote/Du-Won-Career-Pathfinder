import os
import pandas as pd
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_mistralai import ChatMistralAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langdetect import detect
from google.cloud import translate_v2 as translate
from dotenv import load_dotenv
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.callbacks.base import BaseCallbackHandler
from typing import Any, Dict, List, AsyncIterator
import asyncio
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
import spacy
import re  # added

# --- Configuration ---
PERSIST_DIRECTORY = "./all_min_chromadb"
EMBEDDING_MODEL = "all-minilm:l6-v2"
DEFAULT_OLLAMA_MODEL = "llama3.2"
MISTRAL_FT_MODEL = "ft:ministral-3b-latest:9b8fa9c6:20250902:e97f6b36"
DATA_PATH = './ground_truth/processed_job.json'

# --- Global Variables ---
vectordb = None
llm_instances = {}
rag_chain_instances = {}
nlp = None

def _initialize_mistral_llm():
    """Initializes the Mistral LLM from environment variables."""
    load_dotenv()
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError("MISTRAL_API_KEY not found in environment variables.")
    llm = ChatMistralAI(api_key=api_key, model=MISTRAL_FT_MODEL)
    print("Mistral LLM initialized.")
    return llm

def _initialize_ollama_llm(model_name: str):
    """Initializes an Ollama LLM."""
    llm = OllamaLLM(model=model_name)
    print(f"Ollama LLM '{model_name}' initialized.")
    return llm

def _initialize_gemini_llm():
    """Initializes the Gemini LLM from environment variables."""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)
    print("Gemini LLM initialized.")
    return llm

def get_llm(model_name: str = DEFAULT_OLLAMA_MODEL):
    """Loads and caches the specified LLM."""
    if model_name not in llm_instances:
        if model_name == "custom_mistral":
            llm_instances[model_name] = _initialize_mistral_llm()
        elif model_name == "gemini":
            llm_instances[model_name] = _initialize_gemini_llm()
        else:
            llm_instances[model_name] = _initialize_ollama_llm(model_name)
    return llm_instances[model_name]

def detect_language(text: str) -> str:
    """Detects the language of the input text."""
    try:
        return detect(text)
    except:
        return "en"

def translate_to_burmese(text: str) -> str:
    """Translates the text to Burmese."""
    translate_client = translate.Client()
    result = translate_client.translate(text, target_language="my")
    return result["translatedText"]

def _initialize_vector_store():
    """
    Initializes the ChromaDB vector store. Loads from disk if it exists,
    otherwise creates it from the source data.
    """
    global vectordb
    if vectordb is not None: return

    embedding_function = OllamaEmbeddings(model=EMBEDDING_MODEL)
    if os.path.exists(PERSIST_DIRECTORY) and os.listdir(PERSIST_DIRECTORY):
        print("Loading existing ChromaDB vector store...")
        vectordb = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embedding_function)
    else:
        print("No existing ChromaDB found. Creating a new one...")
        try:
            df = pd.read_json(DATA_PATH)
            if df.empty: raise ValueError("DataFrame loaded from JSON is empty.")
        except (FileNotFoundError, ValueError) as e:
            print(f"Error loading data: {e}")
            return

        all_documents = [Document(page_content=row.get('unified_document', ''), metadata={"job_title": row.get('job_title'), "original_index": index}) for index, row in df.iterrows()]
        if not all_documents:
            print("No documents were created from the source file. Cannot create vector store.")
            return

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(all_documents)
        print(f"Total chunks prepared for embedding: {len(chunks)}")

        vectordb = Chroma.from_documents(documents=chunks, embedding=embedding_function, persist_directory=PERSIST_DIRECTORY)
        vectordb.persist()
    print(f"ChromaDB vector store is ready with {vectordb._collection.count()} documents.")

def create_rag_chain(llm: Any):
    """Creates a RAG chain with the given LLM."""
    if vectordb is None:
        raise Exception("Vector store not available, cannot create RAG chain.")

    retriever = vectordb.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 2}
    )

    _template = """
    You are a career recommendation assistant. Your goal is to provide clear, concise, and well-structured answers based on the user's query and the provided context.

    **Instructions for your response:**
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
    Human: {question}
    Assistant:"""
    
    QA_CHAIN_PROMPT = PromptTemplate.from_template(_template)

    rag_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        combine_docs_chain_kwargs={"prompt": QA_CHAIN_PROMPT}
    )
    return rag_chain

def get_rag_chain_for_model(model_name: str = DEFAULT_OLLAMA_MODEL):
    """Returns a RAG chain for the specified model."""
    if model_name not in rag_chain_instances:
        llm = get_llm(model_name)
        rag_chain_instances[model_name] = create_rag_chain(llm)
    return rag_chain_instances[model_name]

def _initialize_spacy():
    """Loads the spaCy model."""
    global nlp
    if nlp is None:
        try:
            # try a larger model first if available, better NER/lemmatization
            nlp = spacy.load("en_core_web_md")
            print("spaCy model 'en_core_web_md' loaded successfully.")
        except Exception:
            try:
                nlp = spacy.load("en_core_web_sm")
                print("spaCy model 'en_core_web_sm' loaded successfully.")
            except OSError:
                print("spaCy model not found. Install with:\npython -m spacy download en_core_web_sm")
                nlp = None

# Extraction of Keywords
def extract_keywords_from_text_spacy(text: str) -> str:
    """
    Extracts de-identified, domain-relevant keywords/phrases.
    - Strips URLs, emails, phone numbers, and raw numbers.
    - Removes PERSON, GPE/LOC, DATE/TIME, and other non-skill entities.
    - Keeps informative noun chunks and nouns/proper-nouns.
    - Deduplicates, scores by frequency and phrase length, and returns top-N.
    """
    if nlp is None:
        _initialize_spacy()
        if nlp is None:
            return ""

    # Pre-clean obvious PII/artifacts
    URL_RE = re.compile(r'(https?://\S+|www\.\S+)', re.I)
    EMAIL_RE = re.compile(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', re.I)
    PHONE_RE = re.compile(r'(\+?\d[\d\s().-]{7,}\d)')  # matches +95..., 09..., 9440017735 etc.
    # Remove links/emails/phones. Keep hyphens (for "full-stack") but drop standalone numbers later.
    cleaned = URL_RE.sub(" ", text)
    cleaned = EMAIL_RE.sub(" ", cleaned)
    cleaned = PHONE_RE.sub(" ", cleaned)

    doc = nlp(cleaned)

    # Entity labels to ignore (PII or non-skill)
    IGNORE_ENTS = {"PERSON", "GPE", "LOC", "FAC", "DATE", "TIME", "CARDINAL", "ORDINAL", "QUANTITY", "MONEY", "PERCENT", "LANGUAGE"}

    # Domain stopwords (extend as needed)
    DOMAIN_STOPWORDS = {
        "email", "phone", "website", "link", "country", "city", "nationality", "birth", "date", "place",
        "address", "current", "year", "student", "bachelor", "degree", "university", "institution",
        "forum", "event", "exhibition", "program", "participant",
        "mother", "tongue", "language", "languages", "level", "levels",
        "basic", "user", "independent", "proficient",
        "contact", "http", "https", "www", "com", "net", "org"
    }

    def valid_token(t):
        if t.is_stop or t.is_punct or t.is_space:
            return False
        if t.like_num or t.is_currency:
            return False
        if t.ent_type_ in IGNORE_ENTS:
            return False
        if t.pos_ in {"PRON", "INTJ", "SYM", "X"}:
            return False
        if len(t.lemma_) < 3:
            return False
        lemma = t.lemma_.lower()
        if lemma in DOMAIN_STOPWORDS:
            return False
        return True

    def normalize_phrase(tokens):
        lemmas = [t.lemma_.lower().strip() for t in tokens if valid_token(t)]
        # drop trailing/leading stopwords again and collapse spaces
        phrase = " ".join(lemmas)
        phrase = re.sub(r"\s+", " ", phrase).strip("- ").strip()
        return phrase

    candidates = []

    # 1) Noun chunks (prefer multi-word skills like "machine learning", "full-stack development")
    for chunk in doc.noun_chunks:
        norm = normalize_phrase([t for t in chunk if not t.is_punct])
        if norm and len(norm) >= 3 and " " in norm:  # multi-word phrases first
            candidates.append(norm)

    # 2) Single strong tokens (NOUN/PROPN) as fallback (e.g., "TensorFlow", "PyTorch", "Laravel")
    for t in doc:
        if valid_token(t) and t.pos_ in {"NOUN", "PROPN"}:
            candidates.append(t.lemma_.lower())

    # 3) Light cleanup: remove any candidate that is purely numeric or contains leftover urls
    def is_bad(c):
        if re.fullmatch(r"[0-9\-() +]+", c):
            return True
        if "http" in c or "www" in c:
            return True
        # filter generic job words without context
        if c in DOMAIN_STOPWORDS:
            return True
        return False

    candidates = [c for c in candidates if not is_bad(c)]

    # Score by frequency and boost multi-word phrases
    text_lc = doc.text.lower()
    freq = {}
    for c in set(candidates):
        try:
            occurrences = len(re.findall(rf"\b{re.escape(c)}\b", text_lc))
        except re.error:
            occurrences = 1
        words = c.count(" ") + 1
        freq[c] = occurrences * (1.0 + 0.25 * (words - 1))  # boost longer phrases

    # Sort, keep top-N
    TOP_N = 25
    sorted_kw = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0]), x[0]))
    top_keywords = [k for k, _ in sorted_kw[:TOP_N]]

    return ", ".join(top_keywords)

def build_keywords_prompt_from_text(text: str) -> str:
    """
    Builds a concise, PII-free focus prompt for the LLM from raw CV text.
    """
    kws = extract_keywords_from_text_spacy(text)
    if not kws:
        return "Focus only on skills and relevant experience. Ignore personal details."
    return (
        "Focus on the following skills, tools, and domains and ignore any personal details "
        f"(names, contacts, locations, links): {kws}."
    )

def perform_semantic_search(query: str, k: int = 3):
    """Performs a similarity search on the vector store."""
    if vectordb is None: return {"error": "Vector store is not available."}
    return vectordb.similarity_search(query, k=k)

class StreamingCallbackHandler(BaseCallbackHandler):
    """Callback handler for streaming responses"""
    def __init__(self):
        self.tokens = []
        self.sources = []
        self.current_response = ""
    
    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.tokens.append(token)
        self.current_response += token
    
    def on_retriever_end(self, documents, **kwargs: Any) -> None:
        self.sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in documents]

async def get_streaming_rag_response(model_name: str, question: str, chat_history: List) -> AsyncIterator[Dict[str, Any]]:
    """Generate streaming response from RAG chain for a given model."""
    try:
        print("get_streaming_rag_response: Entered function")
        rag_chain = get_rag_chain_for_model(model_name)
        llm = get_llm(model_name)
        
        retriever = rag_chain.retriever
        print("get_streaming_rag_response: Getting relevant documents...")
        relevant_docs = await retriever.ainvoke(question)
        print(f"get_streaming_rag_response: Got {len(relevant_docs)} relevant documents.")
        
        sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in relevant_docs]
        yield {"type": "sources", "sources": sources}
        
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        _template = """
        You are a career recommendation assistant. Your goal is to provide clear, concise, and well-structured answers based on the user's query and the provided context.

        **Instructions for your response:**
        - Analyze the user's question, which may contain information from their CV or quiz answers.
        - Use the provided "Context" (which contains information about job descriptions and skills) to formulate your recommendations.
        - **Do NOT repeat or include the user's CV details or quiz answers in your response.**
        - Your response should be a recommendation, not a summary of the information provided by the user.
        - Use bullet points or numbered lists for recommendations, steps, or lists of skills.
        - Keep sentences clear and to the point.
        - Structure your response in a way that is easy to read.

        If you don't know the answer or the context is not sufficient, just say that you don't know, don't try to make up an answer.

        **Chat History:**
        {chat_history}

        **Context:**
        {context}

        **User's Query:**
        Human: {question}
        Assistant:"""
        
        formatted_history = "\n".join([f"{msg.type}: {msg.content}" for msg in chat_history[-5:]])
        
        full_prompt = _template.format(
            context=context,
            chat_history=formatted_history,
            question=question
        )
        
        print("get_streaming_rag_response: Streaming response from LLM...")
        current_response = ""
        async for token in llm.astream(full_prompt):
            content = token.content if hasattr(token, 'content') else token
            current_response += content
            yield {
                "type": "token",
                "content": current_response,
                "is_final": False
            }
        print("get_streaming_rag_response: Finished streaming.")
        
        yield {
            "type": "token",
            "content": current_response,
            "is_final": True
        }
        
    except Exception as e:
        print(f"get_streaming_rag_response: Exception: {e}")
        yield {"error": f"Streaming error: {str(e)}"}


# Initialize vector store on startup
_initialize_vector_store()
_initialize_spacy()
# Pre-initialize the default LLM and RAG chain
get_rag_chain_for_model(DEFAULT_OLLAMA_MODEL)

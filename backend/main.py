import io
import hashlib
import tempfile
import os
from functools import lru_cache
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Any, Iterator, AsyncIterator, Dict, Optional
from pypdf import PdfReader
from langchain_core.messages import HumanMessage, AIMessage
import json
import asyncio
import whisper

# LangChain Imports
from langchain.docstore.document import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma # pyright: ignore[reportMissingImports]
from langchain_ollama import OllamaEmbeddings # pyright: ignore[reportMissingImports]
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# App Services
from llm_services import get_rag_chain_for_model, build_keywords_prompt_from_text, get_streaming_rag_response, get_llm, extract_keywords_from_text_spacy, detect_language, translate_to_burmese, perform_semantic_search
from langchain_kb.expand.wiki_expander import WikiKBGenerator
from classification.run import predict_career

# --- API Application Setup ---
app = FastAPI(
    title="Career Pathfinder API",
    description="API for career recommendations, CV analysis, and job search.",
    version="1.0.0"
)

# --- Global Variables & Services ---
temporary_rag_chain = None
kb_generator = None
whisper_model = None

# In-memory cache for career quiz recommendations
career_quiz_cache = {}
cv_analysis_cache = {}

# --- FastAPI Startup Event ---
@app.on_event("startup")
def startup_event():
    global kb_generator, whisper_model
    
    print("Initializing Knowledge Base Generator...")
    # Initialize with the default LLM
    default_llm = get_llm()
    kb_generator = WikiKBGenerator(llm=default_llm)
    print("Knowledge Base Generator initialized.")
    
    print("Loading Whisper model...")
    # Load Whisper model (base model for good balance of speed and accuracy)
    whisper_model = whisper.load_model("base")
    print("Whisper model loaded successfully.")

# --- CORS Configuration ---
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []
    model: str = "gemini"

class ChatResponse(BaseModel):
    reply: str
    source_documents: list = []

class KBTopic(BaseModel):
    name: str
    sections: List[str]
    num_entries: int = 1

class KBGenerateRequest(BaseModel):
    topics: List[KBTopic]

class QuizAnswersRequest(BaseModel):
    answers: List[str]
    model: str = "gemini"
    history: List[dict] = []

class CSQuizAnswersRequest(BaseModel):
    GPA: float
    Major: str
    Python: str
    SQL: str
    Java: str
    Interested_Domain_1: str
    Interested_Domain_2: str
    Projects_1: str
    Projects_2: str
    Projects_3: str
    model: str = "gemini"
    history: List[dict] = []

class CVAnalysisRequest(BaseModel):
    cv_text: str
    model: str = "gemini"

class StreamChatRequest(BaseModel):
    message: str
    history: List[dict] = []
    model: str = "gemini"

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Career Pathfinder API is running"}

# --- Knowledge Base Endpoints ---

@app.post("/api/kb/generate")
async def generate_knowledge_base(request: KBGenerateRequest):
    if kb_generator is None:
        raise HTTPException(status_code=503, detail="Knowledge Base Generator is not available.")
    print(f"Received request to generate KB for {len(request.topics)} topics.")
    
    # Process topics in parallel for better performance
    tasks = []
    for t in request.topics:
        tasks.append(kb_generator.generate_kb_for_topic(t.name, t.sections, t.num_entries))
    
    # Execute all topic generations concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    full_kb = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Error generating KB for topic {request.topics[i].name}: {result}")
            continue
        full_kb.extend(result)
    
    return full_kb

@app.post("/api/career-quiz/cs", response_model=ChatResponse)
def career_quiz_cs_recommendation(request: CSQuizAnswersRequest):
    user_answers = {
        'GPA': request.GPA,
        'Major': request.Major,
        'Python': request.Python,
        'SQL': request.SQL,
        'Java': request.Java,
        'Interested Domain_1': request.Interested_Domain_1,
        'Interested Domain_2': request.Interested_Domain_2,
        'Projects_1': request.Projects_1,
        'Projects_2': request.Projects_2,
        'Projects_3': request.Projects_3
    }
    
    predicted_career = predict_career(user_answers)
    
    rag_chain = get_rag_chain_for_model(request.model)
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain is not available.")

    prompt = f"Based on the predicted career of '{predicted_career}', provide a detailed career recommendation from the knowledge base. Focus on job roles, required skills, and potential career paths."
    
    chat_history = []
    for msg in request.history:
        if msg['sender'] == 'user':
            chat_history.append(HumanMessage(content=msg['text']))
        elif msg['sender'] == 'bot':
            chat_history.append(AIMessage(content=msg['text']))

    result = rag_chain.invoke({"question": prompt, "chat_history": chat_history})
    sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in result.get('source_documents', [])]
    
    reply = result.get('answer', '')
    
    # Language detection and translation
    lang = detect_language(prompt)
    if lang == 'my':
        reply = translate_to_burmese(reply)
        
    response = ChatResponse(reply=reply, source_documents=sources)
    
    return response

@app.post("/api/career-quiz", response_model=ChatResponse)
def career_quiz_recommendation(request: QuizAnswersRequest):
    # Create a cache key from the sorted answers and model to ensure consistency
    cache_key = f"{request.model}_".join(sorted(request.answers))

    # Check if the recommendation is already in the cache
    if cache_key in career_quiz_cache and not request.history:
        print(f"Returning cached recommendation for quiz answers: {cache_key}")
        return career_quiz_cache[cache_key]

    rag_chain = get_rag_chain_for_model(request.model)
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain is not available.")
    
    quiz_prompt = f'''
        Based on the following quiz answers, provide a career recommendation
        from the knowledge base. Focus on job roles, required skills, and potential career paths.
        If the knowledge base does not contain direct information, provide a general recommendation
        and suggest further exploration. Do not make up information.

        Quiz Answers: {', '.join(request.answers)}

        Career Recommendation:
    '''.strip()

    print(f"Written Print: {quiz_prompt}")
    
    chat_history = []
    for msg in request.history:
        if msg['sender'] == 'user':
            chat_history.append(HumanMessage(content=msg['text']))
        elif msg['sender'] == 'bot':
            chat_history.append(AIMessage(content=msg['text']))

    result = rag_chain.invoke({"question": quiz_prompt, "chat_history": chat_history})
    sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in result.get('source_documents', [])]
    
    reply = result.get('answer', '')

    # Language detection and translation
    lang = detect_language(quiz_prompt)
    if lang == 'my':
        reply = translate_to_burmese(reply)

    response = ChatResponse(reply=reply, source_documents=sources)
    
    # Store the new recommendation in the cache before returning
    if not request.history:
        career_quiz_cache[cache_key] = response
    print(f"Returning career quiz recommendation: {response.reply[:100]}...")
    
    return response

@app.post("/api/kb/test-setup")
def setup_test_rag(kb_data: List[Any]):
    global temporary_rag_chain
    print("Setting up temporary RAG chain...")
    try:
        all_docs = [Document(page_content=sec['content'], metadata={'topic': topic['title'], 'section': sec['title']}) for topic in kb_data for sec in topic['sections']]
        if not all_docs:
            raise HTTPException(status_code=400, detail="Cannot create KB from empty content.")
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        chunks = text_splitter.split_documents(all_docs)
        
        embedding_function = OllamaEmbeddings(model="all-minilm:l6-v2")
        vectordb = Chroma.from_documents(documents=chunks, embedding=embedding_function)
        
        retriever = vectordb.as_retriever()
        prompt_template = '''
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

Assistant:'''.strip()
        
        PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
        
        temporary_rag_chain = RetrievalQA.from_chain_type(llm=get_llm(), chain_type="stuff", retriever=retriever, return_source_documents=True, chain_type_kwargs={"prompt": PROMPT})
        print("Temporary RAG chain is ready.")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kb/test-chat", response_model=ChatResponse)
async def chat_with_test_rag(request: ChatRequest):
    if temporary_rag_chain is None:
        raise HTTPException(status_code=404, detail="Temporary RAG chain not found.")
    try:
        result = temporary_rag_chain.invoke({"query": request.message})
        sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in result.get('source_documents', [])]
        return ChatResponse(reply=result.get('result', ''), source_documents=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kb/test-chat/stream")
def stream_chat_with_test_rag(request: StreamChatRequest):
    """Streaming endpoint for test RAG chatbot"""
    if temporary_rag_chain is None:
        raise HTTPException(status_code=404, detail="Temporary RAG chain not found.")
    
    async def generate_test_stream() -> AsyncIterator[str]:
        try:
            # For test RAG, we'll simulate streaming by chunking the response
            result = temporary_rag_chain.invoke({"query": request.message})
            reply = result.get('result', '')
            sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in result.get('source_documents', [])]
            
            # Send sources first
            sources_data = {"type": "sources", "sources": sources}
            yield f"data: {json.dumps(sources_data)}\n\n"
            
            # Stream the response in chunks
            words = reply.split()
            current_text = ""
            
            for i, word in enumerate(words):
                current_text += (" " if current_text else "") + word
                chunk_data = {"type": "token", "content": current_text, "is_final": i == len(words) - 1}
                yield f"data: {json.dumps(chunk_data)}\n\n"
                await asyncio.sleep(0.05)  # Small delay to simulate streaming
                
        except Exception as e:
            error_data = {"error": str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"
        finally:
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_test_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

# --- Other Endpoints ---

@app.post("/api/analyze-cv-rag", response_model=ChatResponse)
async def analyze_cv_rag(request: CVAnalysisRequest):
    # The cache key should still be based on the full CV text to avoid re-processing
    cache_key = f"spacy_keywords_{request.model}_".join(hashlib.md5(request.cv_text.encode()).hexdigest())

    if cache_key in cv_analysis_cache:
        print(f"Returning cached recommendation for CV analysis.")
        return cv_analysis_cache[cache_key]

    # 1. Extract keywords using spaCy
    keywords = extract_keywords_from_text_spacy(request.cv_text)
    if not keywords:
        raise HTTPException(status_code=400, detail="Could not extract any keywords from the provided CV text.")
    print(f"Extracted keywords from CV: {keywords}")

    rag_chain = get_rag_chain_for_model(request.model)
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain is not available.")
    
    # 2. Create a new prompt with keywords
    cv_prompt = f'''
        Analyze the following keywords from a CV and provide career recommendations,
        suitable job roles, and skill development suggestions based on the
        information provided in your knowledge base.
        Focus on actionable advice and relevant career paths.

        CV Keywords: {keywords}

        Career Analysis and Recommendation:
    '''.strip()
    
    # 3. Invoke the RAG chain
    result = await rag_chain.ainvoke({"question": cv_prompt, "chat_history": []})
    sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in result.get('source_documents', [])]
    
    response = ChatResponse(reply=result.get('answer', ''), source_documents=sources)
    
    # Store the new recommendation in the cache
    cv_analysis_cache[cache_key] = response
    print(f"Returning CV analysis recommendation based on keywords: {response.reply[:100]}...")
    
    return response

@lru_cache(maxsize=50)  # Cache PDF extractions
def extract_pdf_text_cached(file_hash: str, contents_bytes: bytes) -> str:
    """Extract text from PDF with caching based on file hash."""
    reader = PdfReader(io.BytesIO(contents_bytes))
    text = ""
    # Limit to first 5 pages for faster processing
    max_pages = min(5, len(reader.pages))
    for i in range(max_pages):
        text += reader.pages[i].extract_text() + "\n"
    return text

@app.post("/api/upload-cv")
async def analyze_cv(file: UploadFile = File(...)):
    contents = await file.read()
    print(f"Received file: {file.filename}, size: {len(contents)} bytes")
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        # Create hash for caching
        file_hash = hashlib.md5(contents).hexdigest()
        
        # Use cached extraction if available
        text = extract_pdf_text_cached(file_hash, contents)
        
        print(f"Extracted text length: {len(text)} (limited to first 5 pages for performance)")
        print(f"Extracted CV Text:\n{text[:500]}... (truncated for brevity)") # Print first 500 chars
        if not text.strip():
            print("PyPDF extracted no text from the file. It might be a scanned PDF.")
            raise HTTPException(status_code=400, detail="Could not extract text from the uploaded PDF. If it's a scanned document, please ensure the text is selectable or convert it to an image first.")

    except Exception as e:
        print(f"Error during PDF text extraction: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {e}")
    return {"text": text}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_rag(request: ChatRequest):
    rag_chain = get_rag_chain_for_model(request.model)
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain is not available.")
    
    # Convert history from dict to LangChain message objects
    chat_history = []
    for msg in request.history:
        if msg['sender'] == 'user':
            chat_history.append(HumanMessage(content=msg['text']))
        elif msg['sender'] == 'bot':
            chat_history.append(AIMessage(content=msg['text']))

    try:
        # ConversationalRetrievalChain expects 'question' and 'chat_history'
        result = rag_chain.invoke({"question": request.message, "chat_history": chat_history})
        
        # ConversationalRetrievalChain returns 'answer' directly
        reply = result.get('answer', '')
        sources = [{"content": doc.page_content, "metadata": doc.metadata} for doc in result.get('source_documents', [])]
        
        return ChatResponse(reply=reply, source_documents=sources)
    except Exception as e:
        print(f"Error during chat with RAG: {e}")
        raise HTTPException(status_code=500, detail=f"Error during chat with RAG: {e}")

@app.post("/api/chat/stream")
async def stream_chat_with_rag(request: StreamChatRequest):
    """Streaming endpoint for career guidance chatbot"""
    # Detect the language of the user's message
    lang = detect_language(request.message)

    # Convert history from dict to LangChain message objects
    chat_history = []
    for msg in request.history:
        if msg['sender'] == 'user':
            chat_history.append(HumanMessage(content=msg['text']))
        elif msg['sender'] == 'bot':
            chat_history.append(AIMessage(content=msg['text']))

    async def generate_stream() -> AsyncIterator[str]:
        try:
            # If the language is Burmese, get the full response, translate it, then stream it
            if lang == 'my':
                rag_chain = get_rag_chain_for_model(request.model)
                if rag_chain is None:
                    raise HTTPException(status_code=503, detail="RAG chain is not available.")
                
                # Get the full response (non-streamed)
                result = rag_chain.invoke({"question": request.message, "chat_history": chat_history})
                reply = result.get('answer', '')
                
                # Translate the full response
                translated_reply = translate_to_burmese(reply)
                
                # Stream the translated response
                words = translated_reply.split()
                current_text = ""
                for i, word in enumerate(words):
                    current_text += (" " if current_text else "") + word
                    chunk_data = {"type": "token", "content": current_text, "is_final": i == len(words) - 1}
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                    await asyncio.sleep(0.05)  # Small delay to simulate streaming
            else:
                # If the language is not Burmese, stream the response directly
                async for chunk in get_streaming_rag_response(request.model, request.message, chat_history):
                    yield f"data: {json.dumps(chunk)}\n\n"

        except Exception as e:
            error_data = {"error": str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"
        finally:
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )


@app.get("/api/search")
def search_jobs(q: str = Query(..., min_length=3)):
    results = perform_semantic_search(query=q)
    if "error" in results:
        raise HTTPException(status_code=503, detail=results["error"])
    return results

# --- Chatbot Endpoints ---
class ChatbotRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    quiz_data: Optional[Dict] = None  # Optional quiz data for background processing

class ChatbotResponse(BaseModel):
    reply: str

@app.post("/api/chatbot", response_model=ChatbotResponse)
async def chatbot_conversation(request: ChatbotRequest):
    """Simple chatbot using custom Mistral without RAG"""
    try:
        # Get the custom Mistral LLM
        llm = get_llm("custom_mistral")
        
        # Process quiz data in background if provided
        quiz_context = ""
        if request.quiz_data:
            quiz_context = f"""
User Profile (for context only, do not mention this directly):
- GPA: {request.quiz_data.get('GPA', 'N/A')}
- Python Skills: {request.quiz_data.get('Python', 'N/A')}
- SQL Skills: {request.quiz_data.get('SQL', 'N/A')}
- Java Skills: {request.quiz_data.get('Java', 'N/A')}
- Interested Domains: {request.quiz_data.get('Interested_Domain_1', 'N/A')}, {request.quiz_data.get('Interested_Domain_2', 'N/A')}
- Projects: {request.quiz_data.get('Projects_1', 'N/A')}, {request.quiz_data.get('Projects_2', 'N/A')}, {request.quiz_data.get('Projects_3', 'N/A')}

Based on this profile, provide relevant and personalized responses when appropriate.
"""
        
        # Build conversation context from history
        conversation_context = ""
        for msg in request.history[-10:]:
            if msg.get('sender') == 'user':
                conversation_context += f"Human: {msg.get('text', '')}\n"
            elif msg.get('sender') == 'bot':
                conversation_context += f"Assistant: {msg.get('text', '')}\n"
        
        # Create prompt for the chatbot
        prompt = f"""You are a helpful AI assistant. You can discuss various topics and provide general assistance.

{quiz_context}

Previous conversation:
{conversation_context}

Current question:
Human: {request.message}
Assistant:"""
        
        # Get response from Mistral
        response = await llm.ainvoke(prompt)
        reply = response.content if hasattr(response, 'content') else str(response)
        
        return ChatbotResponse(reply=reply)
        
    except Exception as e:
        print(f"Chatbot error: {e}")
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

class StreamChatbotRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    quiz_data: Optional[Dict] = None  # Optional quiz data for background processing

class SpeechToTextResponse(BaseModel):
    text: str
    language: str

@app.post("/api/chatbot/stream")
async def stream_chatbot_conversation(request: StreamChatbotRequest):
    """Streaming chatbot using custom Mistral without RAG"""
    async def generate_stream():
        try:
            # Get the custom Mistral LLM
            llm = get_llm("custom_mistral")
            
            # Process quiz data in background if provided
            quiz_context = ""
            if request.quiz_data:
                quiz_context = f"""
User Profile (for context only, do not mention this directly):
- GPA: {request.quiz_data.get('GPA', 'N/A')}
- Python Skills: {request.quiz_data.get('Python', 'N/A')}
- SQL Skills: {request.quiz_data.get('SQL', 'N/A')}
- Java Skills: {request.quiz_data.get('Java', 'N/A')}
- Interested Domains: {request.quiz_data.get('Interested_Domain_1', 'N/A')}, {request.quiz_data.get('Interested_Domain_2', 'N/A')}
- Projects: {request.quiz_data.get('Projects_1', 'N/A')}, {request.quiz_data.get('Projects_2', 'N/A')}, {request.quiz_data.get('Projects_3', 'N/A')}

Based on this profile, provide relevant and personalized responses when appropriate.
"""
            
            # Build conversation context from history
            conversation_context = ""
            for msg in request.history[-10:]:
                if msg.get('sender') == 'user':
                    conversation_context += f"Human: {msg.get('text', '')}\n"
                elif msg.get('sender') == 'bot':
                    conversation_context += f"Assistant: {msg.get('text', '')}\n"
            
            # Create prompt for the chatbot
            prompt = f"""You are a helpful AI assistant. You can discuss various topics and provide general assistance.

{quiz_context}

Previous conversation:
{conversation_context}

Current question:
Human: {request.message}
Assistant:"""
            
            # Stream response from Mistral
            current_response = ""
            async for token in llm.astream(prompt):
                content = token.content if hasattr(token, 'content') else str(token)
                current_response += content
                yield f"data: {json.dumps({'type': 'token', 'content': current_response, 'is_final': False})}\n\n"
            
            # Send final response
            yield f"data: {json.dumps({'type': 'token', 'content': current_response, 'is_final': True})}\n\n"
            
        except Exception as e:
            error_data = {"error": str(e)}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

# --- Speech-to-Text Endpoint ---
@app.post("/api/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(audio_file: UploadFile = File(...)):
    """Convert audio file to text using Whisper"""
    if whisper_model is None:
        raise HTTPException(status_code=503, detail="Whisper model is not loaded")
    
    # Validate file type
    if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    try:
        # Create temporary file to save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            # Read and write audio content
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe audio using Whisper
            result = whisper_model.transcribe(temp_file_path)
            
            # Extract text and detected language
            transcribed_text = result["text"].strip()
            detected_language = result.get("language", "unknown")
            
            return SpeechToTextResponse(
                text=transcribed_text,
                language=detected_language
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"Speech-to-text error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")


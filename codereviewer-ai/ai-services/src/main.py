from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import os
from dotenv import load_dotenv

from gemini_client import GeminiClient
from code_analyzer import CodeAnalyzer
from models import AnalysisRequest, AnalysisResponse, ChatRequest, ChatResponse

load_dotenv()

app = FastAPI(
    title="CodeReviewer AI - AI Service",
    description="Gemini 3-powered code analysis service",
    version="1.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

gemini_client = GeminiClient(api_key=gemini_api_key)
code_analyzer = CodeAnalyzer(gemini_client)

# In-memory storage (replace with Redis/DB in production)
analysis_cache = {}
chat_sessions = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "CodeReviewer AI - AI Service",
        "status": "running",
        "version": "1.0.0",
        "gemini_model": "gemini-3-flash-preview"
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_code(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Analyze code files using Gemini 3
    
    Args:
        request: Analysis request with code files and language
        
    Returns:
        Analysis results with issues, suggestions, and reasoning
    """
    try:
        # Validate request
        if not request.files or len(request.files) == 0:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Check cache (optional optimization)
        cache_key = f"{request.language}_{hash(str(request.files))}"
        if cache_key in analysis_cache:
            return analysis_cache[cache_key]
        
        # Perform analysis
        print(f"Analyzing {len(request.files)} files in {request.language}...")
        
        result = await code_analyzer.analyze(
            files=request.files,
            language=request.language,
            focus_areas=request.focus_areas
        )
        
        # Cache result
        analysis_cache[cache_key] = result
        
        return result
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Interactive chat about code analysis
    
    Args:
        request: Chat request with review_id and message
        
    Returns:
        AI response to the question
    """
    try:
        # Get or create chat session
        if request.review_id not in chat_sessions:
            chat_sessions[request.review_id] = []
        
        # Get conversation history
        history = chat_sessions[request.review_id]
        
        # Get response from Gemini 3
        response = await gemini_client.chat(
            message=request.message,
            history=history,
            context=request.context
        )
        
        # Update history
        history.append({
            "role": "user",
            "content": request.message
        })
        history.append({
            "role": "assistant",
            "content": response
        })
        
        chat_sessions[request.review_id] = history
        
        return ChatResponse(
            review_id=request.review_id,
            response=response,
            conversation_id=request.review_id
        )
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.get("/api/models")
async def list_models():
    """List available Gemini models"""
    try:
        models = await gemini_client.list_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/cache")
async def clear_cache():
    """Clear analysis cache (admin endpoint)"""
    global analysis_cache, chat_sessions
    analysis_cache.clear()
    chat_sessions.clear()
    return {"message": "Cache cleared"}


if __name__ == "__main__":
    # Run the service
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
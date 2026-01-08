from pydantic import BaseModel
from typing import List, Optional, Dict


class CodeFile(BaseModel):
    """Represents a code file to analyze"""
    path: str
    content: str
    language: Optional[str] = None


class Issue(BaseModel):
    """Represents a code issue found during analysis"""
    id: str
    type: str  # security, performance, quality, architecturecd ccd
    severity: str  # critical, high, medium, low
    file: str
    line: int
    title: str
    description: str
    suggestion: str
    reasoning: str
    code_snippet: str


class AnalysisRequest(BaseModel):
    """Request to analyze code"""
    files: List[CodeFile]
    language: str
    focus_areas: Optional[List[str]] = None


class AnalysisResponse(BaseModel):
    """Response from code analysis"""
    status: str
    summary: Dict
    issues: List[Issue]
    architecture_analysis: str
    files_analyzed: int
    total_lines: int


class ChatRequest(BaseModel):
    """Request for chat interaction"""
    review_id: str
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    """Response from chat"""
    review_id: str
    response: str
    conversation_id: str
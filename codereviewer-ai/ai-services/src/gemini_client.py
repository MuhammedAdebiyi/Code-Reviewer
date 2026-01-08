import requests
import json
import time
from typing import List, Dict, Optional
import asyncio


class GeminiClient:
    """Client for Gemini 3 API"""
    
    def __init__(self, api_key: str, model: str = "gemini-3-flash-preview"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.max_retries = 3
        self.retry_delay = 2  # seconds
        
    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 4096
    ) -> str:
        """
        Generate content using Gemini 3
        
        Args:
            prompt: The input prompt
            temperature: Creativity level (0.0-1.0)
            max_tokens: Maximum response length
            
        Returns:
            Generated text response
        """
        url = f"{self.base_url}/models/{self.model}:generateContent"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.8,
                "topK": 40
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        # Retry logic for rate limits
        for attempt in range(self.max_retries):
            try:
                response = requests.post(
                    f"{url}?key={self.api_key}",
                    headers=headers,
                    json=payload,
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    return text
                    
                elif response.status_code == 429:
                    # Rate limit - wait and retry
                    wait_time = self.retry_delay * (attempt + 1)
                    print(f"Rate limit hit. Waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                    continue
                    
                else:
                    error_data = response.json()
                    raise Exception(f"API error: {error_data}")
                    
            except requests.exceptions.Timeout:
                if attempt < self.max_retries - 1:
                    print(f"Timeout. Retrying... ({attempt + 1}/{self.max_retries})")
                    await asyncio.sleep(self.retry_delay)
                    continue
                raise Exception("Request timed out after retries")
                
            except Exception as e:
                if attempt < self.max_retries - 1:
                    print(f"Error: {str(e)}. Retrying...")
                    await asyncio.sleep(self.retry_delay)
                    continue
                raise
        
        raise Exception("Max retries reached")
    
    async def chat(
        self,
        message: str,
        history: List[Dict] = None,
        context: Optional[str] = None
    ) -> str:
        """
        Multi-turn conversation with context
        
        Args:
            message: User's message
            history: Previous conversation history
            context: Additional context (code, analysis results, etc.)
            
        Returns:
            Assistant's response
        """
        if history is None:
            history = []
        
        # Build conversation context
        conversation = []
        
        # Add context if provided
        if context:
            conversation.append({
                "role": "user",
                "parts": [{"text": f"Context:\n{context}"}]
            })
            conversation.append({
                "role": "model",
                "parts": [{"text": "I understand the context. How can I help?"}]
            })
        
        # Add history
        for msg in history:
            conversation.append({
                "role": "user" if msg["role"] == "user" else "model",
                "parts": [{"text": msg["content"]}]
            })
        
        # Add current message
        conversation.append({
            "role": "user",
            "parts": [{"text": message}]
        })
        
        url = f"{self.base_url}/models/{self.model}:generateContent"
        
        payload = {
            "contents": conversation,
            "generationConfig": {
                "temperature": 0.7,  # Higher for chat
                "maxOutputTokens": 2048
            }
        }
        
        headers = {"Content-Type": "application/json"}
        
        try:
            response = requests.post(
                f"{url}?key={self.api_key}",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                error_data = response.json()
                raise Exception(f"Chat API error: {error_data}")
                
        except Exception as e:
            raise Exception(f"Chat failed: {str(e)}")
    
    async def list_models(self) -> List[str]:
        """
        List available Gemini models
        
        Returns:
            List of model names
        """
        url = f"{self.base_url}/models"
        
        try:
            response = requests.get(
                f"{url}?key={self.api_key}",
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                models = []
                for model in result.get('models', []):
                    name = model.get('name', '')
                    if 'gemini' in name.lower():
                        models.append(name.replace('models/', ''))
                return models
            else:
                raise Exception(f"Failed to list models: {response.status_code}")
                
        except Exception as e:
            raise Exception(f"List models failed: {str(e)}")
    
    def switch_model(self, model: str):
        """Switch to a different Gemini model"""
        self.model = model
        print(f"Switched to model: {model}")
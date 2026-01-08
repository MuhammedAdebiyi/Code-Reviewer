import ast
import re
from typing import List, Dict, Optional
from models import CodeFile, Issue, AnalysisResponse
from gemini_client import GeminiClient


class CodeAnalyzer:
    """Analyzes code using Gemini 3's reasoning capabilities"""
    
    def __init__(self, gemini_client: GeminiClient):
        self.gemini = gemini_client
        
    async def analyze(
        self,
        files: List[CodeFile],
        language: str,
        focus_areas: Optional[List[str]] = None
    ) -> AnalysisResponse:
        """
        Analyze code files using Gemini 3
        
        Args:
            files: List of code files to analyze
            language: Programming language
            focus_areas: Specific areas to focus on (security, performance, etc.)
            
        Returns:
            Analysis results with issues and suggestions
        """
        if focus_areas is None:
            focus_areas = ["security", "performance", "quality", "architecture"]
        
        # Build context from all files
        context = self._build_context(files, language)
        
        # Create analysis prompt
        prompt = self._create_analysis_prompt(context, language, focus_areas)
        
        # Get analysis from Gemini 3
        print("Sending to Gemini 3 for analysis...")
        analysis_text = await self.gemini.generate_content(
            prompt=prompt,
            temperature=0.4,  # Lower for consistent analysis
            max_tokens=4096
        )
        
        # Parse the response into structured format
        issues = self._parse_analysis(analysis_text, files)
        
        # Get architecture analysis
        arch_prompt = self._create_architecture_prompt(context, language)
        arch_analysis = await self.gemini.generate_content(
            prompt=arch_prompt,
            temperature=0.4,
            max_tokens=2048
        )
        
        # Calculate summary statistics
        summary = self._calculate_summary(issues)
        
        return AnalysisResponse(
            status="completed",
            summary=summary,
            issues=issues,
            architecture_analysis=arch_analysis,
            files_analyzed=len(files),
            total_lines=sum(f.content.count('\n') for f in files)
        )
    
    def _build_context(self, files: List[CodeFile], language: str) -> str:
        """Build comprehensive context from all files"""
        context_parts = [f"Language: {language}\n\n"]
        
        for file in files:
            context_parts.append(f"File: {file.path}")
            context_parts.append(f"```{language}")
            context_parts.append(file.content)
            context_parts.append("```\n")
        
        return "\n".join(context_parts)
    
    def _create_analysis_prompt(
        self,
        context: str,
        language: str,
        focus_areas: List[str]
    ) -> str:
        """Create the analysis prompt for Gemini 3"""
        
        focus_desc = ", ".join(focus_areas)
        
        prompt = f"""You are an expert code reviewer with deep knowledge of software engineering best practices.

Analyze the following {language} code and identify issues in these areas: {focus_desc}.

For EACH issue found, provide:
1. **Type**: security | performance | quality | architecture
2. **Severity**: critical | high | medium | low
3. **File**: The file path
4. **Line**: Line number where the issue occurs
5. **Title**: Brief description (max 10 words)
6. **Description**: Detailed explanation of the issue
7. **Suggestion**: Concrete fix with code example
8. **Reasoning**: WHY this is an issue and WHY your fix is better

Use this EXACT format for each issue:

---ISSUE---
Type: [type]
Severity: [severity]
File: [file path]
Line: [line number]
Title: [title]
Description: [detailed description]
Suggestion: [fix with code example]
Reasoning: [explanation of why this matters]
---END---

Code to analyze:
{context}

Analyze thoroughly and find ALL issues. Be specific with line numbers.
"""
        return prompt
    
    def _create_architecture_prompt(self, context: str, language: str) -> str:
        """Create architecture analysis prompt"""
        
        prompt = f"""You are a software architect reviewing this {language} codebase.

Analyze the overall architecture and design patterns used. Provide insights on:

1. **Design Patterns**: What patterns are used? Are they appropriate?
2. **SOLID Principles**: Any violations?
3. **Code Organization**: Is the structure logical and maintainable?
4. **Dependencies**: Any concerning dependencies or coupling?
5. **Scalability**: Will this scale well?
6. **Improvements**: Specific architectural improvements

Be constructive and provide actionable advice.

Code to review:
{context}
"""
        return prompt
    
    def _parse_analysis(self, analysis_text: str, files: List[CodeFile]) -> List[Issue]:
        """Parse Gemini 3's analysis into structured issues"""
        issues = []
        
        # Split by issue markers
        issue_blocks = analysis_text.split("---ISSUE---")
        
        for block in issue_blocks[1:]:  # Skip first empty block
            if "---END---" not in block:
                continue
            
            issue_text = block.split("---END---")[0].strip()
            
            # Parse each field
            issue_data = {}
            for line in issue_text.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    issue_data[key.strip().lower()] = value.strip()
            
            # Create Issue object
            if 'type' in issue_data and 'severity' in issue_data:
                issues.append(Issue(
                    id=f"issue_{len(issues)}",
                    type=issue_data.get('type', 'quality'),
                    severity=issue_data.get('severity', 'medium'),
                    file=issue_data.get('file', 'unknown'),
                    line=int(issue_data.get('line', 0)) if issue_data.get('line', '0').isdigit() else 0,
                    title=issue_data.get('title', 'Code issue detected'),
                    description=issue_data.get('description', ''),
                    suggestion=issue_data.get('suggestion', ''),
                    reasoning=issue_data.get('reasoning', ''),
                    code_snippet=self._extract_snippet(
                        files,
                        issue_data.get('file', ''),
                        int(issue_data.get('line', 0)) if issue_data.get('line', '0').isdigit() else 0
                    )
                ))
        
        # If no issues parsed, create a fallback
        if not issues:
            issues.append(Issue(
                id="info_0",
                type="info",
                severity="low",
                file="general",
                line=0,
                title="Analysis completed",
                description=analysis_text[:500],  # First 500 chars
                suggestion="Review the full analysis for details",
                reasoning="Automated analysis",
                code_snippet=""
            ))
        
        return issues
    
    def _extract_snippet(
        self,
        files: List[CodeFile],
        file_path: str,
        line_num: int,
        context_lines: int = 3
    ) -> str:
        """Extract code snippet around the issue"""
        for file in files:
            if file.path == file_path:
                lines = file.content.split('\n')
                start = max(0, line_num - context_lines - 1)
                end = min(len(lines), line_num + context_lines)
                snippet_lines = lines[start:end]
                return '\n'.join(snippet_lines)
        return ""
    
    def _calculate_summary(self, issues: List[Issue]) -> Dict:
        """Calculate summary statistics"""
        summary = {
            "total": len(issues),
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "by_type": {}
        }
        
        for issue in issues:
            # Count by severity
            severity = issue.severity.lower()
            if severity in summary:
                summary[severity] += 1
            
            # Count by type
            issue_type = issue.type
            if issue_type not in summary["by_type"]:
                summary["by_type"][issue_type] = 0
            summary["by_type"][issue_type] += 1
        
        return summary
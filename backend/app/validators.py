import re
from typing import Optional
from bleach import clean

# Active Enterprise SQL Injection pattern detection
SQL_INJECTION_PATTERNS = [
    r"(\%27)|(')|(\-\-)|(\%23)|(#)",
    r"((\%3D)|(=))[^\n]*((\%27)|(')|(\-\-)|(\%3B)|(;))",
    r"\w*((\%27)|('))((\%6F)|o|(\%4F))((\%72)|r|(\%52))",
    r"((\%27)|('))union",
    r"exec(\s|\+)+(s|x)p\w+",
    r"UNION\s+SELECT",
    r"INSERT\s+INTO",
    r"DELETE\s+FROM",
    r"DROP\s+TABLE",
]

# Active Enterprise XSS pattern detection
XSS_PATTERNS = [
    r"<\s*script[^>]*>.*?<\s*/\s*script\s*>",
    r"<\s*script\b[^>]*>",
    r"javascript\s*:",
    r"vbscript\s*:",
    r"data\s*:\s*text/html",
    r"\bon[a-z]+\s*=",  # Trap DOM event handlers (onload, onerror, etc.)
]


def sanitize_string(value: Optional[str], max_length: int = 255) -> Optional[str]:
    if not value:
        return value
    # Active regex pattern matching against potential malicious XSS payloads
    for pattern in XSS_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValueError("Potentially malicious cross-site scripting (XSS) input payload detected")
            
    # Fully clean and strip HTML elements
    value = clean(value, tags=[], strip=True)
    # Enforce precise string length constraints
    value = value[:max_length]
    
    # Active regex pattern matching against potential malicious SQL payloads
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValueError("Potentially malicious cross-site / SQL input payload detected")
            
    return value

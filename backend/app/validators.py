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


def sanitize_string(value: Optional[str], max_length: int = 255) -> Optional[str]:
    if not value:
        return value
    # Fully clean and strip HTML elements
    value = clean(value, tags=[], strip=True)
    # Enforce precise string length constraints
    value = value[:max_length]
    # Active regex pattern matching against potential malicious SQL payloads
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValueError("Potentially malicious cross-site / SQL input payload detected")
    return value

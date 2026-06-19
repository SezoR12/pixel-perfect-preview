from slowapi import Limiter
from slowapi.util import get_remote_address

# Consolidated Enterprise Rate Limiter Engine
limiter = Limiter(key_func=get_remote_address)

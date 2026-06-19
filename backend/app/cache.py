import json
import logging
from functools import wraps
from typing import Callable, Any, Dict

import redis
from app.config import settings

cache_logger = logging.getLogger("tureep.cache")

# Exceptionally resilient dual-mode cache engine (Redis TCP or In-Memory fallback)
_memory_fallback: Dict[str, str] = {}
_redis_available = False
_redis_client: Any = None

try:
    _redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=2)
    _redis_client.ping()
    _redis_available = True
    cache_logger.info("✅ Resilient Redis caching engine successfully connected.")
except Exception as e:
    cache_logger.warning(f"⚠️ Redis network pool unreachable ({e}). Initializing pristine in-memory fallback cache...")


def _json_default(obj: Any) -> Any:
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    return str(obj)


def cached(timeout: int = 300):
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Formulate deterministic cache key
            cache_key = f"cache:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            cached_value = None
            if _redis_available and _redis_client:
                try:
                    cached_value = _redis_client.get(cache_key)
                except Exception:
                    pass
            else:
                cached_value = _memory_fallback.get(cache_key)

            if cached_value:
                try:
                    return json.loads(cached_value)
                except Exception:
                    pass

            result = func(*args, **kwargs)
            serialized = json.dumps(result, default=_json_default)
            
            if _redis_available and _redis_client:
                try:
                    _redis_client.setex(cache_key, timeout, serialized)
                except Exception:
                    pass
            else:
                _memory_fallback[cache_key] = serialized

            return result
        return wrapper
    return decorator

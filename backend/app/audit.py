import json
import logging
import hmac
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any
from app.config import settings

audit_logger = logging.getLogger("tureep.audit")

# Enterprise cryptographic running chain hash ensuring absolute log immutability
_running_ledger_hash = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).hexdigest()


def log_audit_event(
    event_type: str,
    user_id: Optional[int],
    resource_type: str,
    resource_id: Optional[Any],
    action: str,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    global _running_ledger_hash
    timestamp = datetime.utcnow().isoformat()
    
    # Construct raw payload for chaining
    raw_payload = f"{timestamp}:{event_type}:{user_id}:{resource_type}:{resource_id}:{action}:{ip_address}:{user_agent}:{json.dumps(details or {}, sort_keys=True)}"
    
    # Formulate cryptographic HMAC running chain link
    new_chain_link = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        f"{_running_ledger_hash}:{raw_payload}".encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    _running_ledger_hash = new_chain_link

    event = {
        "timestamp": timestamp,
        "event_type": event_type,
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": str(resource_id) if resource_id is not None else None,
        "action": action,
        "details": details or {},
        "ip_address": ip_address,
        "user_agent": user_agent,
        "cryptographic_chain_link": new_chain_link,
    }
    audit_logger.info(json.dumps(event))

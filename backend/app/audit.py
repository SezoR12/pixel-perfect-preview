import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any

audit_logger = logging.getLogger("tureep.audit")


def log_audit_event(
    event_type: str,
    user_id: Optional[int],
    resource_type: str,
    resource_id: Optional[int],
    action: str,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
):
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "action": action,
        "details": details or {},
        "ip_address": ip_address,
    }
    audit_logger.info(json.dumps(event))

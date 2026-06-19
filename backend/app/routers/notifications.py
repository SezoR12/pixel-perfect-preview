from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Notification, NotificationType, NotificationPriority, User
from app.schemas import NotificationRead
from app.security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/", response_model=List[NotificationRead])
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.post("/mark-read/{notif_id}", response_model=NotificationRead)
def mark_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read == False).update({"read": True})
    db.commit()
    return {"status": "ok", "count_marked": True}


@router.post("/trigger-mock", response_model=NotificationRead)
def trigger_mock(
    title: str,
    message: str,
    type: str = "in_app",
    priority: str = "medium",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Map strings to enums
    type_enum = NotificationType(type) if type in [t.value for t in NotificationType] else NotificationType.IN_APP
    prio_enum = NotificationPriority(priority) if priority in [p.value for p in NotificationPriority] else NotificationPriority.MEDIUM

    notif = Notification(
        user_id=current_user.id,
        title=title,
        message=f"[Dispatched via {type_enum.value.upper()}] {message}",
        type=type_enum,
        priority=prio_enum,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # In production, this would invoke a Redis Celery task or ARQ job
    # e.g., redis_queue.enqueue("send_firebase_push", user_id, title, message)
    return notif

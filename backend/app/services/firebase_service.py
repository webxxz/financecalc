import json
from typing import Any, Dict, List, Optional

import firebase_admin
from fastapi import HTTPException
from firebase_admin import auth, credentials, firestore

from app.core.config import get_settings

settings = get_settings()


def _initialize_firebase() -> Optional[firebase_admin.App]:
    if firebase_admin._apps:
        return firebase_admin.get_app()

    if settings.firebase_credentials_json:
        creds_dict = json.loads(settings.firebase_credentials_json)
        cred = credentials.Certificate(creds_dict)
        return firebase_admin.initialize_app(cred)

    if settings.firebase_credentials_path:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        return firebase_admin.initialize_app(cred)

    return None


def verify_firebase_token(id_token: str) -> Dict[str, Any]:
    app = _initialize_firebase()
    if app is None:
        raise HTTPException(status_code=503, detail="Firebase is not configured")

    try:
        return auth.verify_id_token(id_token)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=401, detail="Invalid Firebase token") from exc


def get_firestore_client() -> firestore.Client:
    app = _initialize_firebase()
    if app is None:
        raise HTTPException(status_code=503, detail="Firestore is not configured")
    return firestore.client()


def save_user_calculation(uid: str, data: Dict[str, Any]) -> str:
    db = get_firestore_client()
    doc_ref = db.collection("users").document(uid).collection("calculations").document()
    doc_ref.set(data)
    return doc_ref.id


def list_user_calculations(uid: str, limit: int = 50) -> List[Dict[str, Any]]:
    db = get_firestore_client()
    docs = (
        db.collection("users")
        .document(uid)
        .collection("calculations")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


def save_user_goal(uid: str, data: Dict[str, Any]) -> str:
    db = get_firestore_client()
    doc_ref = db.collection("users").document(uid).collection("goals").document()
    doc_ref.set(data)
    return doc_ref.id


def list_user_goals(uid: str, limit: int = 100) -> List[Dict[str, Any]]:
    db = get_firestore_client()
    docs = (
        db.collection("users")
        .document(uid)
        .collection("goals")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


def update_user_goal(uid: str, goal_id: str, data: Dict[str, Any]) -> None:
    db = get_firestore_client()
    doc_ref = db.collection("users").document(uid).collection("goals").document(goal_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Goal not found")
    doc_ref.update(data)


def delete_user_goal(uid: str, goal_id: str) -> None:
    db = get_firestore_client()
    doc_ref = db.collection("users").document(uid).collection("goals").document(goal_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Goal not found")
    doc_ref.delete()

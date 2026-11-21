import hashlib
import hmac
import io
import os
import secrets
import smtplib
from datetime import datetime
from email.message import EmailMessage

import qrcode
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PointTransaction, User, Voucher


router = APIRouter(prefix="/api", tags=["cont și vouchere"])
POINTS_PER_COLLECTION = 50


class RegisterPayload(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)


class LoginPayload(BaseModel):
    email: str
    password: str


class CollectionPayload(BaseModel):
    collection_point_id: str = Field(min_length=1, max_length=80)
    scan_code: str = Field(min_length=6, max_length=255)


class RedeemPayload(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=2, max_length=500)
    cost: int = Field(gt=0, le=100_000)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{digest.hex()}"


def password_matches(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split(":", 1)
        actual = hashlib.scrypt(password.encode("utf-8"), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
        return hmac.compare_digest(actual.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "points": user.points,
        "recycled_count": user.recycled_count,
    }


def current_user(
    authorization: str | None = Header(default=None), db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Autentificare necesară.")
    token = authorization.removeprefix("Bearer ").strip()
    user = db.scalar(select(User).where(User.session_token == token))
    if not user:
        raise HTTPException(status_code=401, detail="Sesiune expirată. Conectează-te din nou.")
    return user


def session_response(user: User) -> dict:
    return {"token": user.session_token, "user": serialize_user(user)}


def make_qr_png(payload: str) -> bytes:
    image = qrcode.make(payload)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def serialize_voucher(voucher: Voucher) -> dict:
    return {
        "id": voucher.id,
        "title": voucher.title,
        "description": voucher.description,
        "code": voucher.code,
        "qr_payload": voucher.qr_payload,
        "email_status": voucher.email_status,
        "created_at": voucher.created_at.isoformat(),
    }


def email_voucher(user: User, voucher: Voucher) -> str:
    """Trimite voucherul numai când SMTP este configurat în variabilele de mediu."""
    host = os.getenv("SMTP_HOST")
    sender = os.getenv("SMTP_FROM")
    if not host or not sender:
        return "not_configured"

    message = EmailMessage()
    message["Subject"] = f"Voucher EcoScan: {voucher.title}"
    message["From"] = sender
    message["To"] = user.email
    message.set_content(
        f"Ai revendicat voucherul {voucher.title}.\n\n"
        f"Cod: {voucher.code}\n"
        "Arată codul QR atașat partenerului pentru validare."
    )
    message.add_attachment(
        make_qr_png(voucher.qr_payload),
        maintype="image",
        subtype="png",
        filename=f"voucher-{voucher.code}.png",
    )
    try:
        use_ssl = os.getenv("SMTP_SSL", "false").lower() == "true"
        smtp_client = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        with smtp_client(host, int(os.getenv("SMTP_PORT", "587")), timeout=15) as smtp:
            if not use_ssl and os.getenv("SMTP_TLS", "true").lower() == "true":
                smtp.starttls()
            username = os.getenv("SMTP_USERNAME")
            password = os.getenv("SMTP_PASSWORD")
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
        return "sent"
    except (OSError, smtplib.SMTPException):
        return "failed"


@router.post("/auth/register", status_code=201)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=422, detail="Introdu o adresă de email validă.")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Există deja un cont pentru acest email.")
    user = User(
        email=email,
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        session_token=secrets.token_urlsafe(32),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return session_response(user)


@router.post("/auth/login")
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.strip().lower()))
    if not user or not password_matches(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Emailul sau parola nu sunt corecte.")
    user.session_token = secrets.token_urlsafe(32)
    db.commit()
    return session_response(user)


@router.get("/me")
def me(user: User = Depends(current_user)):
    return {"user": serialize_user(user)}


@router.post("/collections/scan")
def register_collection(
    payload: CollectionPayload,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    # Codul QR este unic: aceeași chitanță/aparat nu poate adăuga puncte de două ori.
    if db.scalar(select(PointTransaction).where(PointTransaction.scan_code == payload.scan_code)):
        raise HTTPException(status_code=409, detail="Acest cod QR a fost deja folosit.")
    transaction = PointTransaction(
        user_id=user.id,
        amount=POINTS_PER_COLLECTION,
        reason="colectare_confirmată",
        collection_point_id=payload.collection_point_id,
        scan_code=payload.scan_code,
    )
    user.points += POINTS_PER_COLLECTION
    user.recycled_count += 1
    db.add(transaction)
    db.commit()
    return {"awarded_points": POINTS_PER_COLLECTION, "user": serialize_user(user)}


@router.post("/vouchers/redeem", status_code=201)
def redeem_voucher(
    payload: RedeemPayload,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if user.points < payload.cost:
        raise HTTPException(status_code=400, detail="Nu ai suficiente puncte pentru acest voucher.")
    voucher = Voucher(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        cost=payload.cost,
        code=secrets.token_urlsafe(9).upper(),
        qr_payload=f"RECLAR-VOUCHER:{secrets.token_urlsafe(28)}",
    )
    user.points -= payload.cost
    db.add(PointTransaction(user_id=user.id, amount=-payload.cost, reason="voucher_revendicat"))
    db.add(voucher)
    db.flush()
    voucher.email_status = email_voucher(user, voucher)
    db.commit()
    return {"voucher": serialize_voucher(voucher), "user": serialize_user(user)}


@router.get("/vouchers/mine")
def my_vouchers(user: User = Depends(current_user), db: Session = Depends(get_db)):
    vouchers = db.scalars(
        select(Voucher).where(Voucher.user_id == user.id).order_by(Voucher.created_at.desc())
    ).all()
    return {"vouchers": [serialize_voucher(voucher) for voucher in vouchers]}


@router.get("/vouchers/{code}/qr")
def voucher_qr(code: str, db: Session = Depends(get_db)):
    voucher = db.scalar(select(Voucher).where(Voucher.code == code))
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher inexistent.")
    return Response(content=make_qr_png(voucher.qr_payload), media_type="image/png")


@router.post("/vouchers/{code}/send-email")
def send_voucher_email(
    code: str,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    voucher = db.scalar(select(Voucher).where(Voucher.code == code, Voucher.user_id == user.id))
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucherul nu există în contul tău.")
    voucher.email_status = email_voucher(user, voucher)
    db.commit()
    if voucher.email_status == "not_configured":
        raise HTTPException(status_code=503, detail="Trimiterea emailului nu este configurată încă.")
    if voucher.email_status == "failed":
        raise HTTPException(status_code=502, detail="Emailul nu a putut fi trimis. Verifică setările SMTP.")
    return {"email": user.email, "email_status": voucher.email_status}

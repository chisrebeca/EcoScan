from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    session_token: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    recycled_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(80))
    collection_point_id: Mapped[str | None] = mapped_column(String(80), nullable=True)
    scan_code: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Voucher(Base):
    __tablename__ = "vouchers"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    cost: Mapped[int] = mapped_column(Integer)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    qr_payload: Mapped[str] = mapped_column(String(160), unique=True)
    email_status: Mapped[str] = mapped_column(String(32), default="not_configured")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

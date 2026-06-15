"""
FixIt — Database Layer (SQLAlchemy ORM)

Mirrors the production PostgreSQL schema exactly:
  • UUIDs for all primary / foreign keys
  • Technician / user locations live in the `addresses` table (is_active = true)
  • Bookings are stored in the `orders` table
  • Technician category is a FK → categories table
  • load_to_dataframes() uses ORM joins — no raw SQL
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Optional

import pandas as pd
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    Text,
    create_engine,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker

from app.config import BOOKINGS_CSV, DATABASE_URL, TECHNICIANS_CSV, USERS_CSV

logger = logging.getLogger(__name__)

Base = declarative_base()


# ════════════════════════════════════════════════
#  ORM Models  (mirrors production schema exactly)
# ════════════════════════════════════════════════

class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    technicians = relationship("TechnicianModel", back_populates="category_rel")
    services = relationship("ServiceModel", back_populates="category_rel")


class ServiceModel(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    name = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    min_price = Column(Integer, nullable=True)
    max_price = Column(Integer, nullable=True)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )

    category_rel = relationship("CategoryModel", back_populates="services")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    email = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    full_name = Column(Text, nullable=True)

    # Resolves to the single active address for this user
    addresses = relationship(
        "AddressModel",
        primaryjoin="and_(AddressModel.user_id == UserModel.id, AddressModel.is_active == True)",
        foreign_keys="AddressModel.user_id",
        uselist=False,
        viewonly=True,
    )
    orders = relationship("OrderModel", back_populates="user")
    reviews = relationship("ReviewModel", back_populates="user")


class TechnicianModel(Base):
    __tablename__ = "technicians"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    first_name = Column(Text, nullable=True)
    last_name = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    is_available = Column(Boolean, nullable=True)
    criminal_record = Column(Text, nullable=True)
    birth_certificate = Column(Text, nullable=True)
    profile_image = Column(Text, nullable=True)
    national_id = Column(Text, nullable=True)
    base_hourly_rate = Column(BigInteger, nullable=True)
    rating = Column(Float, nullable=True)
    years_experience = Column(BigInteger, nullable=True)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", onupdate="CASCADE", ondelete="SET NULL"),
        nullable=True,
    )
    description = Column(Text, nullable=True)
    status = Column(Text, nullable=False, default="pending")
    blocked_reason = Column(Text, nullable=True)
    blocked_at = Column(DateTime(timezone=True), nullable=True)
    blocked_by = Column(Text, nullable=True)
    block_pending = Column(Boolean, nullable=False, default=False)

    category_rel = relationship("CategoryModel", back_populates="technicians")
    # Resolves to the single active address for this technician
    addresses = relationship(
        "AddressModel",
        primaryjoin="and_(AddressModel.technician_id == TechnicianModel.id, AddressModel.is_active == True)",
        foreign_keys="AddressModel.technician_id",
        uselist=False,
        viewonly=True,
    )
    orders = relationship("OrderModel", back_populates="technician")
    reviews = relationship("ReviewModel", back_populates="technician")


class AddressModel(Base):
    __tablename__ = "addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    technician_id = Column(UUID(as_uuid=True), ForeignKey("technicians.id", ondelete="CASCADE"), nullable=True)
    city = Column(Text, nullable=False)
    street = Column(Text, nullable=False)
    building_no = Column(Text, nullable=True)
    apartment_no = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=False)


class OrderModel(Base):
    """Maps to the `orders` table (was `bookings` in the old schema)."""
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    problem_description = Column(Text, nullable=True)
    status = Column(Text, nullable=False, default="pending")
    attachment = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=True)
    technician_id = Column(UUID(as_uuid=True), ForeignKey("technicians.id"), nullable=True)
    scheduled_date = Column(Date, nullable=False)
    active = Column(Boolean, nullable=False, default=False)
    cancellation_reason = Column(Text, nullable=True)
    final_price = Column(Integer, nullable=True)
    payment_method = Column(Text, nullable=True)
    destination_address_id = Column(
        UUID(as_uuid=True),
        ForeignKey("addresses.id"),
        nullable=True,
    )
    scheduled_start_at = Column(DateTime(timezone=True), nullable=True)
    arrived_at = Column(DateTime(timezone=True), nullable=True)
    user_completed_at = Column(DateTime(timezone=True), nullable=True)
    technician_completed_at = Column(DateTime(timezone=True), nullable=True)
    inspection_fee = Column(Integer, nullable=False, default=0)
    inspection_distance_km = Column(Float, nullable=True)
    work_price = Column(Integer, nullable=True)

    user = relationship("UserModel", back_populates="orders")
    technician = relationship("TechnicianModel", back_populates="orders")
    service = relationship("ServiceModel")
    review = relationship("ReviewModel", back_populates="order", uselist=False)
    destination_address = relationship("AddressModel")


class ReviewModel(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rating = Column(SmallInteger, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    technician_id = Column(UUID(as_uuid=True), ForeignKey("technicians.id", ondelete="CASCADE"), nullable=False)

    user = relationship("UserModel", back_populates="reviews")
    order = relationship("OrderModel", back_populates="review")
    technician = relationship("TechnicianModel", back_populates="reviews")


# ════════════════════════════════════════════════
#  Database Manager
# ════════════════════════════════════════════════

class DatabaseManager:
    """
    Manages SQLAlchemy engine, session creation, CSV seeding,
    and DataFrame extraction for the recommendation pipeline.
    """

    def __init__(self, db_url: Optional[str] = None) -> None:
        self.db_url = db_url or DATABASE_URL
        self.engine = create_engine(self.db_url, echo=False)
        self.SessionLocal = sessionmaker(bind=self.engine, autocommit=False, autoflush=False)
        self._ready = False

    # ────────────────────────────────────────────
    #  Schema management
    # ────────────────────────────────────────────
    def create_tables(self) -> None:
        """No-op: Supabase schema is managed externally."""
        logger.info("Skipping create_tables (Supabase-managed schema)")

    def get_session(self) -> Session:
        """Return a new database session."""
        return self.SessionLocal()

    # ────────────────────────────────────────────
    #  CSV → Database seeding
    # ────────────────────────────────────────────
    def seed_from_csv(self) -> None:
        """No-op: do not seed local CSV data when using Supabase."""
        self._ready = True
        logger.info("Skipping seed_from_csv (using live Supabase data)")

    # ────────────────────────────────────────────
    #  Database → DataFrames (for the pipeline)
    # ────────────────────────────────────────────
    def load_to_dataframes(self) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Return (users_df, technicians_df, bookings_df) shaped for the pipeline.

        All joins use SQLAlchemy ORM relationships — no raw SQL.

        Output column contracts:
          users_df    : user_id, full_name, phone, join_date, latitude, longitude
          techs_df    : technician_id, name, phone, category, is_available,
                        base_hourly_rate, rating, years_experience, description,
                        status, latitude, longitude
          bookings_df : booking_id, user_id, technician_id, problem_description,
                        service_category, booking_date, status, rating

        Note: Only technicians with status='verified' are included.
        """
        session = self.get_session()
        try:
            from sqlalchemy.orm import joinedload
            # ── Users ───────────────────────────────────────────────
            all_users: list[UserModel] = session.query(UserModel).options(
                joinedload(UserModel.addresses)
            ).all()
            users_rows = []
            for u in all_users:
                addr = u.addresses  # single active address via relationship
                users_rows.append({
                    "user_id": str(u.id),
                    "full_name": u.full_name,
                    "phone": u.phone,
                    "join_date": u.created_at,
                    "latitude": addr.latitude if addr else None,
                    "longitude": addr.longitude if addr else None,
                })
            users_df = pd.DataFrame(users_rows)

            # ── Technicians (only verified) ─────────────────
            all_techs: list[TechnicianModel] = (
                session.query(TechnicianModel)
                .options(
                    joinedload(TechnicianModel.addresses),
                    joinedload(TechnicianModel.category_rel)
                )
                .filter(TechnicianModel.status == "verified")
                .all()
            )
            tech_rows = []
            for t in all_techs:
                addr = t.addresses  # single active address via relationship
                category_name = t.category_rel.name if t.category_rel else None
                tech_rows.append({
                    "technician_id": str(t.id),
                    "name": f"{t.first_name or ''} {t.last_name or ''}".strip(),
                    "phone": t.phone,
                    "category": category_name,
                    "is_available": t.is_available,
                    "base_hourly_rate": t.base_hourly_rate,
                    "rating": t.rating,
                    "years_experience": t.years_experience,
                    "description": t.description,
                    "status": t.status,
                    "latitude": addr.latitude if addr else None,
                    "longitude": addr.longitude if addr else None,
                })
            techs_df = pd.DataFrame(tech_rows)

            from sqlalchemy.orm import joinedload
            # ── Orders → bookings shape ────────────────────
            all_orders: list[OrderModel] = session.query(OrderModel).options(
                joinedload(OrderModel.technician).joinedload(TechnicianModel.category_rel),
                joinedload(OrderModel.review)
            ).all()
            order_rows = []
            for o in all_orders:
                category_name = (
                    o.technician.category_rel.name
                    if o.technician and o.technician.category_rel
                    else None
                )
                order_rows.append({
                    "booking_id": str(o.id),
                    "user_id": str(o.user_id),
                    "technician_id": str(o.technician_id),
                    "problem_description": o.problem_description,
                    "service_category": category_name,
                    "booking_date": o.scheduled_date,
                    "status": str(o.status),
                    "rating": o.review.rating if o.review else None,
                })
            bookings_df = pd.DataFrame(order_rows)

            logger.info(
                "Loaded from DB  —  %d users  |  %d technicians  |  %d orders",
                len(users_df), len(techs_df), len(bookings_df),
            )
            return users_df, techs_df, bookings_df

        finally:
            session.close()
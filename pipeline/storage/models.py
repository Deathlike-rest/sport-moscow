from uuid import uuid4
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Venue(Base):
    __tablename__ = "venues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    district = Column(String(100))
    metro_station = Column(String(100))
    location = Column(Geometry("POINT", srid=4326))
    phone = Column(String(50))
    website = Column(Text)
    description = Column(Text)
    is_indoor = Column(Boolean)
    has_parking = Column(Boolean, default=False)
    has_shower = Column(Boolean, default=False)
    has_equipment = Column(Boolean, default=False)
    has_cafe = Column(Boolean, default=False)
    has_coach = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    completeness_score = Column(Float)
    price_level = Column(Integer)
    external_ids = Column(JSONB, default=dict)
    raw_data = Column(JSONB, default=dict)
    last_scraped_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    sports = relationship("VenueSport", back_populates="venue", cascade="all, delete-orphan")
    pricing = relationship("Pricing", back_populates="venue", cascade="all, delete-orphan")
    coaches = relationship("Coach", back_populates="venue", cascade="all, delete-orphan")
    working_hours = relationship("WorkingHours", back_populates="venue", cascade="all, delete-orphan")
    photos = relationship("VenuePhoto", back_populates="venue", cascade="all, delete-orphan")


class Sport(Base):
    __tablename__ = "sports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(50), unique=True, nullable=False)
    name_ru = Column(String(100), nullable=False)

    venue_sports = relationship("VenueSport", back_populates="sport")


class VenueSport(Base):
    __tablename__ = "venue_sports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    sport_id = Column(Integer, ForeignKey("sports.id", ondelete="CASCADE"), nullable=False)

    venue = relationship("Venue", back_populates="sports")
    sport = relationship("Sport", back_populates="venue_sports")

    __table_args__ = (UniqueConstraint("venue_id", "sport_id"),)


class Pricing(Base):
    __tablename__ = "pricing"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    price_rub = Column(Integer, nullable=False)
    duration_min = Column(Integer, default=60)
    is_peak = Column(Boolean, default=False)
    day_type = Column(String(20), default="any")  # weekday | weekend | any

    venue = relationship("Venue", back_populates="pricing")


class Coach(Base):
    __tablename__ = "coaches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    bio = Column(Text)
    photo_url = Column(Text)
    sports = Column(JSONB, default=list)
    price_per_hour_rub = Column(Integer)

    venue = relationship("Venue", back_populates="coaches")


class WorkingHours(Base):
    __tablename__ = "working_hours"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Mon, 6=Sun
    opens_at = Column(String(5))   # "08:00"
    closes_at = Column(String(5))  # "23:00"
    is_closed = Column(Boolean, default=False)

    venue = relationship("Venue", back_populates="working_hours")

    __table_args__ = (UniqueConstraint("venue_id", "day_of_week"),)


class VenuePhoto(Base):
    __tablename__ = "venue_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    is_primary = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    venue = relationship("Venue", back_populates="photos")


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True))
    status = Column(String(20), default="running")  # running | success | failed
    stats = Column(JSONB, default=dict)

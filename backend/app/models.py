from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    climate = Column(String, index=True)
    description = Column(Text, nullable=True)
    places = relationship("Place", back_populates="city", cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, index=True)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    city_id = Column(Integer, ForeignKey("cities.id"))
    city = relationship("City", back_populates="places")
    favorites = relationship("Favorite", back_populates="place", cascade="all, delete-orphan")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    place_id = Column(Integer, ForeignKey("places.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="favorites")
    place = relationship("Place", back_populates="favorites")
    
    # Уникальная пара пользователь-место
    __table_args__ = (UniqueConstraint('user_id', 'place_id', name='unique_user_place'),)
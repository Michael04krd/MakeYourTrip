from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
class Config:
    from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: str
    password: str

# Для городов
class CityBase(BaseModel):
    name: str
    climate: str
    description: Optional[str] = None

class CityCreate(CityBase):
    pass

class CityResponse(CityBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Для мест
class PlaceBase(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    address: Optional[str] = None
    rating: float = 0.0
    city_id: int

class PlaceCreate(PlaceBase):
    pass

class PlaceResponse(PlaceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
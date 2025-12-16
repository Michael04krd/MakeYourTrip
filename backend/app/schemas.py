from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(
        min_length=3, 
        max_length=20,
        pattern=r'^[a-zA-Z0-9_]+$'
    )
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = Field(None, max_length=20) 

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

class FavoriteBase(BaseModel):
    place_id: int

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteResponse(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime
    place: PlaceResponse
    
    class Config:
        from_attributes = True

class FavoriteDeleteResponse(BaseModel):
    message: str
    place_id: int
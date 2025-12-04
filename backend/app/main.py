from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import jwt
from sqlalchemy import inspect

from app.database import engine, get_db
from app import models, schemas, auth
from sqlalchemy.exc import IntegrityError

# Проверяем и создаем таблицы если нужно
try:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        models.Base.metadata.create_all(bind=engine)
        print("✅ Таблицы созданы")
    else:
        print("✅ Таблицы уже существуют")
except Exception as e:
    print(f"⚠️  Ошибка проверки таблиц: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MakeYourTrip API работает!"}

@app.get("/health")
def health():
    return {"status": "ok"}

# Регистрация
@app.post("/api/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    from sqlalchemy import or_
    
    existing = db.query(models.User).filter(
        or_(models.User.username == user.username, models.User.email == user.email)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при создании пользователя")

# Вход (упрощенный без OAuth2PasswordRequestForm)
@app.post("/api/token", response_model=schemas.Token)
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    
    if not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Неверное имя пользователя или пароль")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Получение текущего пользователя
@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(token: str, db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Токен не предоставлен")
    
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    return user

# Режимы работы
@app.get("/api/mode/{mode_name}")
def select_mode(mode_name: str):
    if mode_name not in ["definite", "indefinite"]:
        raise HTTPException(status_code=400, detail="Неверный режим")
    
    return {"message": f"Режим '{mode_name}' выбран", "mode": mode_name}
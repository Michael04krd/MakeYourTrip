from app.database import engine
from app import models

print("Создание таблиц в базе данных...")
models.Base.metadata.create_all(bind=engine)
print("Таблицы успешно созданы!")
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Contacto(Base):
    __tablename__ = "contactos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=True)
    mensaje = Column(Text, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

# Crear todas las tablas
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente en la base de datos")
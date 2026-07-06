from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # Isinya nanti: 'super_admin' atau 'user'

    # Relasi: Satu user bisa punya banyak data ekonomi
    datasets = relationship("EconomicData", cascade="all, delete-orphan")
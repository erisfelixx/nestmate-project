from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    # Базова інфо
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)       # "male" / "female" / "other"
    city = Column(String)
    photo_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)  # телефон, telegram і тд
    interests = Column(Text, nullable=True)  # вільний текст: "граю на гітарі, люблю каву"

    # Житло
    role = Column(String)         # "looking" / "hosting"
    budget_min = Column(Integer)
    budget_max = Column(Integer)
    move_in_date = Column(Date, nullable=True)

    # Звички — шкала 1-7
    schedule = Column(String)         # "early_bird" / "night_owl"
    cleanliness = Column(Integer)     # 1-7
    noise_level = Column(Integer)     # 1-7
    guests_frequency = Column(Integer) # 1-7

    # Булеві звички
    has_pets = Column(Boolean, default=False)
    ok_with_pets = Column(Boolean, default=True)
    smoking = Column(Boolean, default=False)
    ok_with_smoking = Column(Boolean, default=False)

    # Чи шукає співмешканця зараз
    is_active_search = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")
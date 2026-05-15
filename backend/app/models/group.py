from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String)
    budget_min = Column(Integer)
    budget_max = Column(Integer)
    target_size = Column(Integer, default=3)   # скільки людей всього
    creator_id = Column(Integer, ForeignKey("users.id"))
    is_active_search = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("GroupMember", back_populates="group")
    requests = relationship("GroupRequest", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    joined_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="members")

class GroupRequest(Base):
    __tablename__ = "group_requests"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    applicant_user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")  # pending/accepted/declined
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="requests")
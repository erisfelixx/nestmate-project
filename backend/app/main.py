from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import User, Profile, ContactRequest  
from app.routers import auth, profiles, matching, contacts, groups
from app.models.group import Group, GroupMember, GroupRequest


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Roommate Finder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(matching.router)
app.include_router(contacts.router)
app.include_router(groups.router)

@app.get("/")
def root():
    return {"message": "Roommate Finder API is running"}
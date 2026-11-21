
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.api.account import router as account_router
from app.database import Base, engine


load_dotenv(Path(__file__).resolve().parent / ".env")


app = FastAPI(
    title="EcoScan API",
    description="Backend API pentru aplicatia EcoScan",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "EcoScan API functioneaza!",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EcoScan Backend"
    }


app.include_router(ai_router)
app.include_router(account_router)

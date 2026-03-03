from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, documents, questionnaire, export
from os import getenv

app = FastAPI(title="EduVault API")

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

env_origins = [o.strip() for o in getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]
allow_origins = default_origins + env_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(questionnaire.router, prefix="/questionnaire", tags=["questionnaire"])
app.include_router(export.router, prefix="/export", tags=["export"])

@app.get("/")
def root():
    return {"message": "EduVault API is running"}

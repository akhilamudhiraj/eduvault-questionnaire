from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter()

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

class AuthPayload(BaseModel):
    email: str
    password: str

@router.post("/signup")
async def signup(payload: AuthPayload):
    try:
        result = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password
        })
        return {"message": "Signup successful", "user": result.user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(payload: AuthPayload):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        return {
            "access_token": result.session.access_token,
            "user": result.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout():
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel
from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY
from docx import Document
from pdfminer.high_level import extract_text
import io

router = APIRouter()

def get_supabase(token: str):
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return client

class DocumentCreate(BaseModel):
    name: str
    content: str


def extract_document_content(filename: str, data: bytes) -> str:
    lower_name = filename.lower()

    if lower_name.endswith((".txt", ".md")):
        return data.decode("utf-8", errors="ignore").strip()

    if lower_name.endswith(".docx"):
        file_stream = io.BytesIO(data)
        doc = Document(file_stream)
        return "\n".join(p.text for p in doc.paragraphs).strip()

    if lower_name.endswith(".pdf"):
        file_stream = io.BytesIO(data)
        return extract_text(file_stream).strip()

    raise HTTPException(
        status_code=400,
        detail="Unsupported file type. Use .txt, .md, .docx, or .pdf"
    )

@router.post("/upload")
async def upload_document(doc: DocumentCreate, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase(token)

    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user.user.id

    result = supabase.table("documents").insert({
        "user_id": user_id,
        "name": doc.name,
        "content": doc.content
    }).execute()

    return {"message": "Document uploaded", "data": result.data}


@router.post("/upload-file")
async def upload_document_file(
    file: UploadFile = File(...),
    name: str | None = Form(default=None),
    authorization: str = Header(...)
):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase(token)

    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user.user.id

    file_data = await file.read()
    if not file_data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    doc_name = (name or file.filename or "Untitled Document").strip()
    doc_content = extract_document_content(file.filename or "", file_data)

    if not doc_content:
        raise HTTPException(status_code=400, detail="No readable text found in file")

    result = supabase.table("documents").insert({
        "user_id": user_id,
        "name": doc_name,
        "content": doc_content
    }).execute()

    return {"message": "File uploaded and parsed", "data": result.data}

@router.get("/list")
async def list_documents(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase(token)

    user = supabase.auth.get_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = user.user.id
    result = supabase.table("documents").select("*").eq("user_id", user_id).execute()
    return {"documents": result.data}

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = get_supabase(token)

    supabase.table("documents").delete().eq("id", doc_id).execute()
    return {"message": "Document deleted"}

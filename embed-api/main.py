from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
import fitz  # PyMuPDF

app = FastAPI(title="Embedding API")

model = SentenceTransformer("all-MiniLM-L6-v2")


class EmbedRequest(BaseModel):
    text: str


class EmbedBatchRequest(BaseModel):
    texts: list[str]


class EmbedResponse(BaseModel):
    embedding: list[float]
    dimensions: int


class EmbedBatchResponse(BaseModel):
    embeddings: list[list[float]]
    dimensions: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    embedding = model.encode(req.text).tolist()
    return EmbedResponse(embedding=embedding, dimensions=len(embedding))


@app.post("/embed/batch", response_model=EmbedBatchResponse)
def embed_batch(req: EmbedBatchRequest):
    if not req.texts or all(not t.strip() for t in req.texts):
        raise HTTPException(status_code=400, detail="Texts cannot be empty")
    embeddings = model.encode(req.texts).tolist()
    return EmbedBatchResponse(
        embeddings=embeddings, dimensions=len(embeddings[0])
    )


class ParsePdfResponse(BaseModel):
    text: str
    pages: int


@app.post("/parse-pdf", response_model=ParsePdfResponse)
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    content = await file.read()
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
        text = "\n".join(text_parts).strip()
        if not text:
            raise HTTPException(status_code=400, detail="PDF contains no extractable text")
        return ParsePdfResponse(text=text, pages=len(text_parts))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

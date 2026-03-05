from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np

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

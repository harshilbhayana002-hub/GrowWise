"""
main.py — FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.habits   import router as habits_router
from app.api.analysis import router as analysis_router

app = FastAPI(
    title="GrowWise API",
    description="GrowWise — ML-powered behavioral habit & learning intelligence",
    version="1.0.0",
)

# Allow Vite dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(habits_router)
app.include_router(analysis_router)


@app.get("/health")
def health():
    return {"status": "ok"}

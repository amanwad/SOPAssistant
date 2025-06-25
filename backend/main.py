from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from file_handlers import FileHandler

app = FastAPI()

# Allow CORS for your frontend (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize file handler
file_handler = FileHandler()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_location = UPLOAD_DIR / file.filename
    
    # Save the uploaded file
    with open(file_location, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Process the file to extract text content
    processing_result = file_handler.process_file(str(file_location))
    
    return {
        "filename": file.filename,
        "saved_to": str(file_location),
        "processing_result": processing_result
    }

@app.get("/supported-formats/")
async def get_supported_formats():
    """Get list of supported file formats"""
    return {
        "supported_formats": file_handler.get_supported_formats(),
        "total_formats": len(file_handler.get_supported_formats())
    }

@app.get("/health/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "File processing service is running"} 
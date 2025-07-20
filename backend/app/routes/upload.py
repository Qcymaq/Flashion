from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.schemas.user import User
from app.utils.auth import get_current_active_user, get_current_admin_user
import os
import shutil
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from bson import ObjectId

router = APIRouter()

# Configuration
UPLOAD_DIR = Path("static/uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create uploads directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def is_valid_image(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

@router.post("/images/{product_id}", response_model=List[str])
@router.post("/images", response_model=List[str])
async def upload_images(
    files: List[UploadFile] = File(...),
    product_id: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user)
):
    uploaded_files = []
    errors = []

    # Validate product_id if provided
    if product_id and not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )

    for file in files:
        try:
            # Validate file type
            if not is_valid_image(file.filename):
                errors.append(f"Invalid file type: {file.filename}")
                continue

            # Check file size
            file_size = 0
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset file pointer

            if file_size > MAX_FILE_SIZE:
                errors.append(f"File too large: {file.filename}")
                continue

            # Generate unique filename with original extension
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            original_ext = Path(file.filename).suffix.lower()
            safe_filename = f"{timestamp}_{file.filename}"
            file_path = UPLOAD_DIR / safe_filename

            # Ensure the upload directory exists
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Return the URL path
            uploaded_files.append(f"/static/uploads/{safe_filename}")

        except Exception as e:
            errors.append(f"Error uploading {file.filename}: {str(e)}")

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Some files failed to upload", "errors": errors}
        )

    return uploaded_files 
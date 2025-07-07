from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import Response
from PIL import Image
import io
from ..utils.virtual_makeup import VirtualMakeupProcessor
from typing import Optional, Literal

router = APIRouter()
makeup_processor = VirtualMakeupProcessor()

@router.post("/try-makeup")
async def try_makeup(
    image: UploadFile = File(...),
    lips_color: str = Form(...),
    lips_intensity: int = Form(...),
    cheeks_color: str = Form(...),
    cheeks_intensity: int = Form(...),
    makeup_type: Literal["lips", "cheeks", "both"] = Form(...)
):
    try:
        # Log received parameters
        print(f"Received parameters: lips_color={lips_color}, lips_intensity={lips_intensity}, cheeks_color={cheeks_color}, cheeks_intensity={cheeks_intensity}, makeup_type={makeup_type}")
        
        # Read and validate image
        contents = await image.read()
        if not contents:
            raise HTTPException(status_code=400, detail="No image data received")
            
        input_image = Image.open(io.BytesIO(contents))
        
        # Process makeup with provided parameters
        if makeup_type == "lips":
            result_image = makeup_processor.apply_makeup(
                input_image,
                lips_color,
                lips_intensity,
                None,  # No cheek color
                0,     # No cheek intensity
            )
        elif makeup_type == "cheeks":
            result_image = makeup_processor.apply_makeup(
                input_image,
                None,  # No lip color
                0,     # No lip intensity
                cheeks_color,
                cheeks_intensity,
            )
        else:  # both
            result_image = makeup_processor.apply_makeup(
                input_image,
                lips_color,
                lips_intensity,
                cheeks_color,
                cheeks_intensity,
            )
        
        if result_image is None:
            raise HTTPException(status_code=400, detail="Failed to process image")
        
        # Convert the result image to bytes
        img_byte_arr = io.BytesIO()
        result_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        # Return the image directly
        return Response(
            content=img_byte_arr.getvalue(),
            media_type="image/jpeg",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
        
    except Exception as e:
        print(f"Error in try_makeup: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e)) 
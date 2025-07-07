from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.consultation import Consultation, ConsultationStatus, ConsultationCreate
from ..utils.auth import get_current_admin_user
from ..models.user import User
from bson import ObjectId

router = APIRouter()

@router.post("/")
async def create_consultation(consultation_data: ConsultationCreate):
    consultation = Consultation(**consultation_data.dict())
    await consultation.create()
    return consultation

@router.get("/", response_model=List[Consultation])
async def get_consultations(current_user: User = Depends(get_current_admin_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    consultations = await Consultation.find_all().to_list()
    return consultations

@router.put("/{consultation_id}/status")
async def update_consultation_status(
    consultation_id: str,
    status: ConsultationStatus,
    current_user: User = Depends(get_current_admin_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not ObjectId.is_valid(consultation_id):
        raise HTTPException(status_code=400, detail="Invalid consultation ID")
    
    consultation = await Consultation.find_one({"_id": ObjectId(consultation_id)})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    consultation.status = status
    await consultation.save()
    return consultation

@router.delete("/{consultation_id}")
async def delete_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not ObjectId.is_valid(consultation_id):
        raise HTTPException(status_code=400, detail="Invalid consultation ID")
    
    consultation = await Consultation.find_one({"_id": ObjectId(consultation_id)})
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    
    await consultation.delete()
    return {"message": "Consultation deleted successfully"} 
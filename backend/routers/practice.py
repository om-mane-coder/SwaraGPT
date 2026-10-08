import os
import sys
from fastapi import APIRouter
from pydantic import BaseModel

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai.tools import tool_generate_practice_exercise, tool_get_user_profile

router = APIRouter(prefix="/api/practice", tags=["Personalized Practice Engine"])

class GenerateExerciseRequest(BaseModel):
    raga_name: str = "Yaman"
    weak_swara: str = "Shuddha Ga"

@router.post("/generate")
async def generate_exercise(req: GenerateExerciseRequest):
    profile = tool_get_user_profile(user_id=1)
    weak = req.weak_swara or (profile["weak_swaras"][0] if profile["weak_swaras"] else "Shuddha Ga")
    exercise = tool_generate_practice_exercise(req.raga_name, weak)
    return exercise

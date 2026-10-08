from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class RagaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    aliases: Optional[str] = None
    tradition: str
    thaat: Optional[str] = None
    mela: Optional[str] = None
    aaroha: str
    avaroha: str
    vadi: str
    samvadi: str
    pakad: str
    chalan: Optional[str] = None
    jati: str
    time_period: str
    season: str
    rasa: str
    swara_set: List[str]
    important_swaras: List[str]
    avoided_swaras: List[str]
    famous_compositions: List[str]
    description: str
    practice_guidance: Optional[str] = None


class TaalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    matras: int
    vibhags: str
    theka: str
    sam_matra: int
    khali_matra: str
    description: Optional[str] = None


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    difficulty: str
    duration_minutes: int
    target_notes: str
    instructions: str
    raga_id: Optional[int] = None


class ConceptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    definition: str
    examples: Optional[str] = None
    importance_for_learners: Optional[str] = None

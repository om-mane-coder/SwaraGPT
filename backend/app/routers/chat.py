"""
SwaraGPT - AI Virtual Guru Conversational Router
Coordinates user inquiries with domain RAG knowledge retrieval,
performance telemetry context injection, and AI provider generation.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.connection import get_db
from app.models.user import User
from app.models.chat import Conversation, Message
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, ConversationResponse
from app.services.auth_service import get_current_user_optional
from app.rag.retriever import retriever
from app.ai.providers import get_ai_provider

router = APIRouter()

GURU_SYSTEM_PROMPT = """You are SwaraGPT, an authentic AI-powered Virtual Guru and Master Vocalist in Indian Classical Music.
Your pedagogical knowledge encompasses Hindustani and Carnatic traditions:
- Swaras (Shuddha, Komal, Tivra) and the 22 Shrutis microtonal framework
- Raga grammar (Aroha, Avaroha, Vadi, Samvadi, Pakad, Thaat/Mela, Time Theory)
- Vocal techniques (Kharaj Sadhana, Alankars, Meend, Gamak, Andolan, Murki, Kan-swar)
- Specific feedback on student's pitch accuracy, cent deviations, and tonic stability.

Guidelines:
1. Speak warmly, respectfully, and constructively, embodying the venerable Guru-Shishya tradition.
2. Ground your explanations in authentic classical treatises (Natya Shastra, Sangeeta Ratnakara, Kramik Pustak Malika).
3. If student performance telemetry is provided, analyze the specific weak swaras and cent errors.
4. If an inquiry asks about undocumented raga rules or facts beyond verified classical musicology, state clearly: "I don't have enough verified information in my musicology knowledge base to answer that confidently."
5. Never invent or hallucinate raga rules.
"""


@router.post("", response_model=ChatMessageResponse)
async def chat_with_guru(
    req: ChatMessageRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Send question or performance critique request to the AI Virtual Guru."""
    user_id = current_user.id if current_user else 1
    conversation_id = req.conversation_id or f"conv_{uuid.uuid4().hex[:10]}"

    # Ensure conversation exists
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        conv = Conversation(
            id=conversation_id,
            user_id=user_id,
            title=req.message[:50],
            mode="Guru Mode"
        )
        db.add(conv)
        await db.flush()

    # Save user message
    user_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    user_msg = Message(
        id=user_msg_id,
        conversation_id=conversation_id,
        sender="user",
        content=req.message,
        message_type="text",
    )
    db.add(user_msg)

    # 1. RAG Knowledge Retrieval
    matched_docs, has_context = retriever.retrieve(req.message, top_k=3)
    citations = retriever.format_citations(matched_docs)

    # 2. Performance Context Preparation
    perf_dict = req.performance_context.model_dump() if req.performance_context else None

    # 3. AI Generation
    ai_provider = get_ai_provider()
    answer_text = await ai_provider.generate_response(
        prompt=req.message,
        system_instruction=GURU_SYSTEM_PROMPT,
        context_docs=matched_docs,
        performance_context=perf_dict,
    )

    # 4. Save Assistant message
    assistant_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)
    assistant_msg = Message(
        id=assistant_msg_id,
        conversation_id=conversation_id,
        sender="assistant",
        content=answer_text,
        message_type="text",
        metadata_json={"citations": citations}
    )
    db.add(assistant_msg)
    await db.commit()

    # Formulate context-aware suggested drills
    p_lower = req.message.lower()
    if "yaman" in p_lower or "gandhar" in p_lower or "tivra" in p_lower:
        suggested_drills = [
            "Hold Gandhar for 4 beats at 60 BPM",
            "Slow Meend from Tivra Ma to Pa (55 BPM)",
            "Sing Yaman Pakad: .N R G, M' P, D P M' G R, .N R S"
        ]
    elif "bhairav" in p_lower or "andolan" in p_lower:
        suggested_drills = [
            "Practice Komal Re Andolan at 50 BPM",
            "Hold Komal Dhaivat for 4 beats",
            "Sing Bhairav Pakad: G M (d)d P, G M (r)r S"
        ]
    elif "besur" in p_lower or "drift" in p_lower or "score" in p_lower or "pitch" in p_lower or "performance" in p_lower:
        suggested_drills = [
            "10-min morning Kharaj Sadhana on Sa",
            "Hold sustained notes within ±10 cents Sur zone",
            "Sing .N R G with Tanpura drone"
        ]
    elif "shruti" in p_lower:
        suggested_drills = [
            "Explore 22 Shrutis Interactive Visualizer",
            "Compare Just Intonation vs 12-TET",
            "Sing 4 Shrutis of Shadja (Sa)"
        ]
    elif "meend" in p_lower or "gamak" in p_lower:
        suggested_drills = [
            "Practice 2-note Meend: Pa to Ga legato",
            "Diaphragmatic Gamak drill at 65 BPM",
            "Sing continuous glide without step breaks"
        ]
    else:
        suggested_drills = [
            "Analyze my recent singing performance",
            "Teach me Raga Yaman and its Pakad",
            "Give me a 20-minute daily Riyaz routine"
        ]

    return {
        "id": assistant_msg_id,
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": answer_text,
        "response": answer_text,
        "message": answer_text,
        "citations": citations,
        "suggested_drills": suggested_drills,
        "created_at": now
    }


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """List recent chat conversations for the user."""
    user_id = current_user.id if current_user else 1
    stmt = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc())
    res = await db.execute(stmt)
    convs = res.scalars().all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "message_count": len(c.messages) if c.messages else 0
        }
        for c in convs
    ]


@router.get("/history/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full message history for a conversation."""
    stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    res = await db.execute(stmt)
    msgs = res.scalars().all()
    return msgs

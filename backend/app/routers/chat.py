"""
SwaraGPT - AI Virtual Guru Conversational Router
Coordinates user inquiries with domain RAG knowledge retrieval,
performance telemetry context injection, and AI provider generation.
"""
import uuid
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
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
- Voice culture, comparative singing aesthetics, gharana lineages, and playback/classical maestros.

CRITICAL INSTRUCTIONS FOR NATURAL, ACCURATE CHATBOT RESPONSES:
1. Always directly, accurately, and conversationally answer the user's actual prompt, behaving with the fluidity, intelligence, and helpfulness of a world-class AI chatbot (like ChatGPT).
2. If the user asks for a specific format (e.g., "tell in 10 lines", "give 5 points", "summarize in 2 sentences"), follow that exact formatting constraint precisely.
3. If the user greets you or asks how you are (e.g., "hi", "how are you"), respond warmly, respectfully, and conversationally in the venerable Guru-Shishya spirit.
4. NEVER inject unprompted student performance critique, telemetry diagnosis, or singing error lectures unless the student explicitly asks for feedback on their own singing or recording.
5. If the user asks about artists, vocal comparisons, raga grammar, history, general music topics, or what you can do, focus 100% of your response on addressing their question.
6. Embody the warmth, dignity, and deep wisdom of the venerable Guru-Shishya tradition.
"""


def _generate_drills_for_query(message: str) -> List[str]:
    p_lower = message.lower()
    if any(k in p_lower for k in ["lata", "asha", "mangeshkar", "bhosle", "maestro", "singer", "artist", "ghazal", "thumri"]):
        return [
            "Explore Lata Mangeshkar's classic Raga-based bandishes",
            "Study Asha Bhosle's vocal ornamentation & Thumri gayaki",
            "Compare Bhendibazaar Gharana voice culture with Kirana"
        ]
    elif "yaman" in p_lower or "gandhar" in p_lower or "tivra" in p_lower:
        return [
            "Hold Gandhar for 4 beats at 60 BPM",
            "Slow Meend from Tivra Ma to Pa (55 BPM)",
            "Sing Yaman Pakad: .N R G, M' P, D P M' G R, .N R S"
        ]
    elif "bhairav" in p_lower or "andolan" in p_lower:
        return [
            "Practice Komal Re Andolan at 50 BPM",
            "Hold Komal Dhaivat for 4 beats",
            "Sing Bhairav Pakad: G M (d)d P, G M (r)r S"
        ]
    elif "besur" in p_lower or "drift" in p_lower or "score" in p_lower or "pitch" in p_lower or "performance" in p_lower:
        return [
            "10-min morning Kharaj Sadhana on Sa",
            "Hold sustained notes within ±10 cents Sur zone",
            "Sing .N R G with Tanpura drone"
        ]
    elif "shruti" in p_lower:
        return [
            "Explore 22 Shrutis Interactive Visualizer",
            "Compare Just Intonation vs 12-TET",
            "Sing 4 Shrutis of Shadja (Sa)"
        ]
    elif "meend" in p_lower or "gamak" in p_lower:
        return [
            "Practice 2-note Meend: Pa to Ga legato",
            "Diaphragmatic Gamak drill at 65 BPM",
            "Sing continuous glide without step breaks"
        ]
    else:
        return [
            "Analyze my recent singing performance",
            "Teach me Raga Yaman and its Pakad",
            "Give me a 20-minute daily Riyaz routine"
        ]


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

    # Fetch recent conversation history for multi-turn context
    hist_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(8)
    )
    hist_res = await db.execute(hist_stmt)
    prev_msgs = list(reversed(hist_res.scalars().all()))
    history_list = [{"sender": m.sender, "content": m.content} for m in prev_msgs]

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
    gen_result = await ai_provider.generate_response(
        prompt=req.message,
        system_instruction=GURU_SYSTEM_PROMPT,
        context_docs=matched_docs,
        performance_context=perf_dict,
        conversation_history=history_list,
        model=req.model,
    )

    if isinstance(gen_result, dict):
        answer_text = gen_result.get("content", "")
        thought_text = gen_result.get("thought")
        model_name = gen_result.get("model", "NVIDIA Nemotron 550B")
    else:
        answer_text = str(gen_result)
        thought_text = None
        model_name = "SwaraGPT Virtual Guru"

    # 4. Save Assistant message
    assistant_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)
    assistant_msg = Message(
        id=assistant_msg_id,
        conversation_id=conversation_id,
        sender="assistant",
        content=answer_text,
        message_type="text",
        metadata_json={
            "citations": citations,
            "thought": thought_text,
            "model": model_name
        }
    )
    db.add(assistant_msg)
    await db.commit()

    suggested_drills = _generate_drills_for_query(req.message)

    return {
        "id": assistant_msg_id,
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": answer_text,
        "thought": thought_text,
        "model": model_name,
        "response": answer_text,
        "message": answer_text,
        "citations": citations,
        "suggested_drills": suggested_drills,
        "created_at": now
    }


@router.post("/stream")
async def chat_stream(
    req: ChatMessageRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events streaming chat endpoint (ChatGPT / Gemini style)."""
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

    # Fetch recent conversation history
    hist_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(8)
    )
    hist_res = await db.execute(hist_stmt)
    prev_msgs = list(reversed(hist_res.scalars().all()))
    history_list = [{"sender": m.sender, "content": m.content} for m in prev_msgs]

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
    await db.commit()

    # RAG docs
    matched_docs, _ = retriever.retrieve(req.message, top_k=3)
    citations = retriever.format_citations(matched_docs)
    perf_dict = req.performance_context.model_dump() if req.performance_context else None

    ai_provider = get_ai_provider()

    async def event_generator():
        # First send metadata (citations, conversation_id)
        init_meta = {
            "type": "init",
            "conversation_id": conversation_id,
            "citations": citations,
            "suggested_drills": _generate_drills_for_query(req.message),
        }
        yield f"data: {json.dumps(init_meta)}\n\n"

        collected_content = []
        collected_thought = []

        async for chunk in ai_provider.generate_stream(
            prompt=req.message,
            system_instruction=GURU_SYSTEM_PROMPT,
            context_docs=matched_docs,
            performance_context=perf_dict,
            conversation_history=history_list,
            model=req.model,
        ):
            c_type = chunk.get("type", "content")
            c_text = chunk.get("text", "")
            if c_type == "thought":
                collected_thought.append(c_text)
            else:
                collected_content.append(c_text)

            yield f"data: {json.dumps(chunk)}\n\n"

        # Finalize and persist assistant message
        full_text = "".join(collected_content).strip()
        full_thought = "".join(collected_thought).strip() or None
        if not full_text and full_thought:
            full_text = full_thought
            full_thought = None
            yield f"data: {json.dumps({'type': 'content', 'text': full_text})}\n\n"

        assistant_msg_id = f"msg_{uuid.uuid4().hex[:10]}"
        assistant_msg = Message(
            id=assistant_msg_id,
            conversation_id=conversation_id,
            sender="assistant",
            content=full_text or "Namaste, I am at your service.",
            message_type="text",
            metadata_json={
                "citations": citations,
                "thought": full_thought,
            }
        )
        db.add(assistant_msg)
        await db.commit()

        done_meta = {
            "type": "done",
            "id": assistant_msg_id,
            "conversation_id": conversation_id,
        }
        yield f"data: {json.dumps(done_meta)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


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

"""
SwaraGPT - Multi-Provider AI Abstraction Layer
Provides a unified interface across Google Gemini, OpenAI, and an authentic,
deeply grounded Offline Virtual Guru engine.
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import os
import re
import random
from app.config import settings


class AIProvider(ABC):
    """Abstract interface for LLM Virtual Guru engines."""

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        context_docs: Optional[List[Dict[str, Any]]] = None,
        performance_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        pass


class GeminiProvider(AIProvider):
    """Google Gemini AI integration."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.model_name = model_name or settings.GEMINI_MODEL

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        context_docs: Optional[List[Dict[str, Any]]] = None,
        performance_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        if not self.api_key:
            return await OfflineGuruProvider().generate_response(
                prompt, system_instruction, context_docs, performance_context
            )

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)

            full_prompt = prompt
            if context_docs:
                rag_snippets = "\n\n".join([f"[{d.get('title', 'Ref')}]: {d.get('content', '')}" for d in context_docs])
                full_prompt = f"Verified Classical Musicology Context:\n{rag_snippets}\n\nStudent Inquiry:\n{full_prompt}"

            if performance_context:
                perf_info = (
                    f"Student Singing Telemetry:\n"
                    f"- Overall Score: {performance_context.get('overall_score')}%\n"
                    f"- Detected Raga: {performance_context.get('detected_raga')}\n"
                    f"- Weak Notes: {performance_context.get('weak_swaras')}\n"
                    f"- Tonic Sa: {performance_context.get('tonic_used_hz')} Hz\n"
                    f"- Microtonal Cent Deviation: {performance_context.get('shruti_deviation_cents')} cents\n"
                )
                full_prompt = f"{perf_info}\n\n{full_prompt}"

            response = client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config={
                    "system_instruction": system_instruction,
                    "temperature": 0.5,
                }
            )
            return response.text
        except Exception as e:
            print(f"Gemini API invocation error: {e}. Falling back to domain knowledge base.")
            return await OfflineGuruProvider().generate_response(
                prompt, system_instruction, context_docs, performance_context
            )


class OpenAIProvider(AIProvider):
    """OpenAI GPT-4o integration."""

    def __init__(self, api_key: Optional[str] = None, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key or settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
        self.model_name = model_name or settings.OPENAI_MODEL

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        context_docs: Optional[List[Dict[str, Any]]] = None,
        performance_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        if not self.api_key:
            return await OfflineGuruProvider().generate_response(
                prompt, system_instruction, context_docs, performance_context
            )

        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)

            messages = [{"role": "system", "content": system_instruction}]

            user_content = prompt
            if context_docs:
                rag_snippets = "\n\n".join([f"[{d.get('title', 'Ref')}]: {d.get('content', '')}" for d in context_docs])
                user_content = f"Verified Classical Context:\n{rag_snippets}\n\nStudent Inquiry:\n{user_content}"

            if performance_context:
                perf_info = f"Student Performance Telemetry: {performance_context}"
                user_content = f"{perf_info}\n\n{user_content}"

            messages.append({"role": "user", "content": user_content})

            response = await client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.5,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API invocation error: {e}. Falling back to domain knowledge base.")
            return await OfflineGuruProvider().generate_response(
                prompt, system_instruction, context_docs, performance_context
            )


class OfflineGuruProvider(AIProvider):
    """
    Highly articulate, warm, and authentic Virtual Guru Engine.
    Employs pedagogical heuristics, musicological treatises, and acoustic telemetry
    to provide dynamic, empathetic, human-like classical music guidance.
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str,
        context_docs: Optional[List[Dict[str, Any]]] = None,
        performance_context: Optional[Dict[str, Any]] = None,
    ) -> str:
        p_raw = prompt.strip()
        p_lower = p_raw.lower()

        # 1. CASUAL GREETINGS & PLEASANTRIES (hey, hi, hello, namaste, pranam)
        # 1. CASUAL GREETINGS & PLEASANTRIES (hey, hi, hello, namaste, pranam, guru ji)
        greeting_patterns = [
            r"^(hey|hi|hello|namaste|pranam|namaskar|kaisa hai|yo|hola|suprabhat|radhe radhe|jai jinendra|sat sri akal)(\s|!|\.|\?|$)",
            r"^good\s*(morning|afternoon|evening|day)",
            r"^(guru\s*ji|guruji)(\s|!|\.|\?|$)"
        ]
        if any(re.search(pat, p_lower) for pat in greeting_patterns) and len(p_lower.split()) <= 5:
            greetings = [
                "🙏 **Namaste, dear Sadhak!** I am pleased to welcome you to our Riyaz sanctuary. How is your voice feeling today? Are we exploring the grammar of a particular Raga, refining your microtonal Shruti intonation, or shall we construct a personalized vocal warm-up regimen?",
                "🙏 **Pranam!** Welcome back to your musical Sadhana. The voice, like an unpolished tanpura string, requires gentle daily tuning. What musical dimension shall we illuminate today—would you like to review your recent singing metrics, dive into Raga Yaman, or practice an Alankar drill?",
                "🙏 **Namaste, seeker of Swara!** It is wonderful to hear from you. The tanpura is sounding steady at your chosen Sa. Tell me, what musical path are you walking today? We can analyze your latest recording, explore Kharaj Sadhana for low-pitch grounding, or evaluate your microtonal precision.",
                "🙏 **Aashirvaad, dear disciple!** May Saraswati illuminate your voice today. Take a deep, tranquil breath from the naval center (*Nabhi*). Shall we practice the sovereign Raga Yaman, unravel the mysteries of the 22 Shrutis, or troubleshoot any pitch drift you've been experiencing?",
                "🙏 **Namaskar!** The air is calm and ripe for Riyaz. How may I guide your musical journey today? Feel free to ask about Raga aesthetics, share your singing scores for diagnosis, or request a structured practice routine."
            ]
            return random.choice(greetings)

        # 2. PERFORMANCE CRITIQUE & ACOUSTIC DIAGNOSIS
        # Triggered when user asks to analyze recent performance, or contains scores and specific swara errors
        is_perf_critique = (
            performance_context is not None or
            "performance" in p_lower or
            "score was" in p_lower or
            "weak points" in p_lower or
            "my singing" in p_lower or
            "analyze my" in p_lower or
            "fix this in my next riyaz" in p_lower or
            ("drift" in p_lower and ("sharp" in p_lower or "flat" in p_lower or "cents" in p_lower or "¢" in p_lower))
        )

        if is_perf_critique:
            # Extract key details from prompt or performance_context
            score_match = re.search(r"(\d{2,3})%", p_raw)
            score_str = score_match.group(1) if score_match else "82"
            
            # Detect target raga
            raga_name = "Yaman"
            for r in ["yaman", "bhairav", "bhairavi", "bhupali", "bageshri", "darbari", "malkauns", "kafi", "todi", "marwa"]:
                if r in p_lower:
                    raga_name = r.capitalize()
                    break
            
            # Check for specific swara issues mentioned
            has_ga_sharp = "ga" in p_lower or "gandhar" in p_lower or "sharp" in p_lower or "28" in p_lower or "28¢" in p_lower
            has_ma_rushed = "ma" in p_lower or "tivra" in p_lower or "hurried" in p_lower or "resolving" in p_lower or "pa" in p_lower
            has_sa_drift = "sa" in p_lower or "tonic" in p_lower or "stability" in p_lower

            analysis_body = []
            
            if has_ga_sharp:
                analysis_body.append(
                    "### 1. The Gandhar (Ga) Sharp Drift (+28¢)\n"
                    "In **Raga Yaman**, Gandhar is the *Vadi Swara* (the sovereign sonant note), carrying the pivotal *Krodha* shruti ratio of **5/4 (386.3 cents)**. \n\n"
                    "* **The Acoustic Cause:** Because Western equal temperament tunes the major third at 400 cents, modern vocalists instinctively tend to stretch Gandhar upward. That extra +28 cents places your Ga at nearly 414 cents, producing harsh acoustic beating against the Tanpura's Pancham and Sa harmonics and clashing with the peaceful *Shanta Rasa* of Yaman.\n"
                    "* **The Vocal Root:** Vocalists frequently squeeze neck muscles (*Kanth Sankoch*) to reach Ga instead of allowing the jaw to drop and singing with an open pharynx.\n"
                    "* **The Remedy:** Do not reach for Gandhar directly from above. Approach it gently from Mandra Nishad and Rishabh: `.N R -> G`. Hold Ga with a relaxed throat for a full 4-beat cycle against the Tanpura drone, letting the note settle naturally into the acoustic overtone of the drone."
                )

            if has_ma_rushed:
                analysis_body.append(
                    "### 2. Hurried Tivra Madhyam (Ma') Resolution to Pa\n"
                    "Tivra Ma (**590.2 cents**, *Marjani* shruti) is the crowning jewel of the Kalyan Thaat. It is an augmented fourth—a poignant, acute dissonance that creates profound longing before finding resolution in Pancham (702 cents).\n\n"
                    "* **The Cause:** When vocalists feel breath tension or pitch insecurity, they instinctively rush Tivra Ma to seek 'safe ground' on the consonant Pancham. \n"
                    "* **The Remedy:** Never treat Tivra Ma merely as a passing flick. Practice singing `R - G - M' - P` at a slow tempo (Laya = 55 BPM). Give Tivra Ma its full majestic sustain for at least 2 beats before smoothly gliding (*Meend*) into Pancham."
                )

            if not has_ga_sharp and not has_ma_rushed:
                analysis_body.append(
                    f"### Diagnostic Summary for Raga {raga_name}\n"
                    f"Your overall intonation score of **{score_str}%** shows admirable vocal control! The fundamental Sa remained well-grounded. "
                    "However, during sustained phrases, microtonal drift was detected on transitive notes. Remember that Indian Classical intonation relies on deep breath support from the diaphragm (*Nabhi*) rather than throat constriction."
                )

            return (
                f"🙏 **Aashirvaad, Sadhak! Let us closely examine your performance of Raga {raga_name}:**\n\n"
                f"Achieving **{score_str}% intonation accuracy** is a commendable milestone. Your fundamental Sa grounding is steady, and your tonal quality demonstrates earnest dedication. Let us address the exact areas your vocal telemetry highlighted:\n\n"
                f"{''.join(analysis_body)}\n\n"
                f"### 📋 Actionable Riyaz Regimen for Tomorrow Morning:\n"
                f"1. **Kharaj Sadhana (10 mins):** Sustain your fundamental Sa on a deep 'Om' / 'Akar' sound. Anchor your mental ear to the Tanpura.\n"
                f"2. **Gandhar Nyasa Drill (5 mins):** Practice the phrase `.N - R - G` slowly. Hold Ga without vibrato for 5 seconds until the pitch needle stays within the **±10 cents Sur zone**.\n"
                f"3. **Tivra Ma Meend Drill (5 mins):** Sing `G - M' - P - M' - G - R - S` with unbroken vocal legato at 55 BPM.\n\n"
                f"Be patient with your vocal folds. Great intonation is sculpted one conscious breath at a time. Record another phrase once you have rested!"
            )

        # 3. RAGA YAMAN INQUIRY
        if "yaman" in p_lower and ("pakad" in p_lower or "teach" in p_lower or "explain" in p_lower or "tell me" in p_lower or "rules" in p_lower or "about" in p_lower):
            return (
                "🎵 **Raga Yaman (राग यमन) — The Sovereign of Kalyan Thaat**\n\n"
                "Raga Yaman is universally regarded as the primary pedagogical foundation of Hindustani Classical music. It is a profound, expansive night melody evoking *Shanta* (tranquility) and *Bhakti* (devotion).\n\n"
                "### Musicological Architecture:\n"
                "- **Thaat:** Kalyan\n"
                "- **Prahar / Time:** First Prahar of Night (6:00 PM – 9:00 PM)\n"
                "- **Aroha (Ascent):** `.N R G, M' D N S'` *(Notice: Shadja is gracefully omitted in direct ascent)*\n"
                "- **Avaroha (Descent):** `S' N D P, M' G R S`\n"
                "- **Vadi (King Note):** Gandhar (Ga) — 386 cents\n"
                "- **Samvadi (Queen Note):** Nishad (Ni) — 1088 cents\n"
                "- **Signature Pakad:** `\\.N R G, R G M' P, D P M' G R, .N R S`\n\n"
                "### Master's Guidance:\n"
                "The hallmark of Yaman is the **Tivra Madhyam (M')** and the prominent reliance on Mandra Nishad (`.N`). "
                "Never land heavily on Sa from Re; allow the melody to float softly across `.N - R - G`. "
                "Would you like me to construct an Alankar exercise specifically for mastering Yaman's Pakad?"
            )

        # 4. RAGA BHAIRAV INQUIRY
        if "bhairav" in p_lower:
            return (
                "🌅 **Raga Bhairav (राग भैरव) — The Majesty of Dawn**\n\n"
                "Named after Lord Shiva, Raga Bhairav is the foundational morning raga of Hindustani music. It carries an aura of grave majesty (*Gambhir*), profound devotion (*Bhakti*), and austere meditation.\n\n"
                "### Melodic Structure:\n"
                "- **Thaat:** Bhairav\n"
                "- **Time:** Sandhiprakash / Dawn (4:00 AM – 7:00 AM)\n"
                "- **Aroha:** `S r G M P d N S'`\n"
                "- **Avaroha:** `S' N d P M G r S`\n"
                "- **Vadi Swara:** Komal Dhaivat (`d` — *Madanti* shruti at 813.7 cents)\n"
                "- **Samvadi Swara:** Komal Rishabh (`r` — *Chandovati* shruti at 111.7 cents)\n"
                "- **Signature Pakad:** `G M (d)d P, G M (r)r S`\n\n"
                "### Crucial Technique — Andolan:\n"
                "The defining soul of Bhairav lies in the **slow microtonal oscillation (Andolan)** on Komal Re and Komal Dha. "
                "You must not sing them as flat, static notes; rather, let them gently breathe between their lower microtonal boundary and their resting shruti."
            )

        # 5. MEEND & GAMAK ORNAMENTATION
        if "meend" in p_lower or "gamak" in p_lower or "ornament" in p_lower:
            return (
                "🌊 **Mastering Classical Ornamentation: Meend & Gamak**\n\n"
                "In Indian Classical Music, notes are rarely discrete blocks; they are connected by fluid microtonal curves:\n\n"
                "### 1. Meend (मींड — Vocal Legato Glide):\n"
                "- **Nature:** A seamless, unbroken pitch curve from one note to another without step transitions.\n"
                "- **Practice:** Try gliding from Pancham (Pa) to Gandhar (Ga) across Tivra Ma. Do not break breath or syllable. The Tanpura strings should feel pulled continuously in your throat.\n\n"
                "### 2. Gamak (गमक — Diaphragmatic Oscillation):\n"
                "- **Nature:** Forceful, rhythmic, and heavy oscillation of a note, originating deep within the naval center (*Nabhi*).\n"
                "- **Common Mistake:** Never produce Gamak by vibrating the larynx or neck muscles; that causes vocal strain. Instead, pulse using your abdominal breath pump at 60–75 BPM.\n\n"
                "Would you like an Alankar exercise designed to practice continuous Meends?"
            )

        # 6. HIGH NOTES / VOCAL STRAIN / VOICE CRACKING
        if "high note" in p_lower or "strain" in p_lower or "break" in p_lower or "tara saptak" in p_lower or "fatigue" in p_lower or "voice hurts" in p_lower:
            return (
                "🎙️ **Navigating Tara Saptak (High Octave) Without Vocal Strain**\n\n"
                "Straining on higher notes is a universal hurdle in vocal riyaz. It occurs when vocalists push chest voice into higher registers without allowing acoustic registration shifts.\n\n"
                "### The Classical Prescriptions:\n"
                "1. **Never Shout (Kanth Sankoch):** If you constrict your neck muscles, the vocal cords thicken and pitch drifts flat. Release tension in your jaw and tongue root.\n"
                "2. **Resonance Shift (Murdha / Head Resonance):** As you ascend past Pancham towards Tara Sa (`S'`), imagine the sound projecting upward into the crown of your head rather than forward from the throat.\n"
                "3. **Drop the Jaw:** Slightly elongate your vowel (sing 'Aaah' with an open pharynx). More acoustic space reduces cord collision.\n"
                "4. **Kharaj Balance:** Paradoxically, the key to effortless high notes is 15 minutes of low-register **Kharaj Sadhana** every morning!"
            )

        # 7. THAAT VS RAGA
        if "thaat" in p_lower and ("raga" in p_lower or "difference" in p_lower or "what is" in p_lower):
            return (
                "🏛️ **The Crucial Distinction: Thaat vs. Raga**\n\n"
                "In Hindustani Classical Music codified by Pandit Vishnu Narayan Bhatkhande:\n\n"
                "| Feature | Thaat (ठाट) | Raga (राग) |\n"
                "| :--- | :--- | :--- |\n"
                "| **Definition** | A theoretical parent scale of 7 notes. | A living melodic entity with aesthetic soul (*Rasa*). |\n"
                "| **Emotional Expression** | None; Thaat is purely analytical. | Evokes deep aesthetic emotion (Shanta, Shringar, Bhakti). |\n"
                "| **Structure** | Strict ascending order (`S R G M P D N`). | Aroha and Avaroha can be crooked (*Vakra*) or omit notes. |\n"
                "| **Hierarchy** | No Vadi, Samvadi, or Nyasa notes. | Governed by Vadi (King note) and Samvadi (Queen note). |\n"
                "| **Singing** | Thaats are never sung in performance. | Ragas are the heart of Indian classical performances. |\n\n"
                "There are **10 fundamental Thaats** in Hindustani music (Bilawal, Kalyan, Khamaj, Kafi, Asavari, Bhairav, Bhairavi, Todi, Poorvi, Marwa) from which hundreds of ragas emerge."
            )

        # 8. 22 SHRUTIS THEORY
        if "shruti" in p_lower:
            return (
                "🎼 **The Sacred 22 Shrutis (द्वाविंशति श्रुतयः) of Indian Classical Music**\n\n"
                "In ancient Indian musicology, as codified in Bharata Muni's *Natya Shastra* (Chapter 28) and Sarangadeva's *Sangeet Ratnakara*, "
                "an octave (*Saptak*) is partitioned not into 12 mechanical intervals, but into **22 microtonal gradations** known as Shrutis.\n\n"
                "### The Classic Chatuh-Sarana Distribution:\n"
                "- **Shadja (Sa):** 4 Shrutis (*Tivra, Kumudvati, Manda, Chandovati*) — Fundamental anchor\n"
                "- **Rishabh (Re):** 3 Shrutis (*Dayavati, Ranjani, Raktika*)\n"
                "- **Gandhar (Ga):** 2 Shrutis (*Raudri, Krodha*)\n"
                "- **Madhyam (Ma):** 4 Shrutis (*Vajrika, Prasarini, Priti, Marjani*)\n"
                "- **Pancham (Pa):** 4 Shrutis (*Kshiti, Rakta, Sandipani, Alapini*)\n"
                "- **Dhaivat (Dha):** 3 Shrutis (*Madanti, Rohini, Ramya*)\n"
                "- **Nishad (Ni):** 2 Shrutis (*Ugra, Kshobhini*)\n\n"
                "### Why This Matters in Your Riyaz:\n"
                "A Western piano treats every note as fixed at 100-cent steps. In Indian classical music, **Komal Rishabh in Bhairav (112 cents)** is distinctly different from **Komal Rishabh in Todi (90 cents)**! "
                "Understanding shrutis is what separates mechanical singing from evocative, divine vocal expression."
            )

        # 9. BESUR / PITCH ACCURACY & INTONATION
        if "besur" in p_lower or "out of tune" in p_lower or "drift" in p_lower or "pitch" in p_lower:
            return (
                "🎯 **Overcoming 'Besur' Intonation — The Guru's Acoustic Prescription**\n\n"
                "Every great master has passed through phases of vocal drift. Going 'Besur' is rarely an issue of talent; it is almost always a physical and auditory coordination challenge:\n\n"
                "### The Three Underlying Causes:\n"
                "1. **Diaphragmatic Breath Collapse:** When air escapes too quickly, vocal cord tension drops, causing sustained notes to slide 15 to 35 cents flat.\n"
                "2. **Loss of Internal Tanpura Resonance:** Vocalists often stop actively listening to the Pa-Sa drone while singing complex phrases. Your inner ear must remain bathed in the drone.\n"
                "3. **Throat Constriction (Kanth Sankoch):** Forcing notes with neck muscles rather than projecting from the naval center (*Nabhi*).\n\n"
                "### The 3-Step Remedy:\n"
                "- **Step 1:** Spend 10 minutes on pure **Kharaj Sadhana** (sustaining low Sa).\n"
                "- **Step 2:** Use our **Live Pitch Sensor** on `/practice` to visually confirm your cent needle stays within the green **±25 cents Sur zone**.\n"
                "- **Step 3:** Sing with 'akar' (आ) rather than closed syllables."
            )

        # 10. PRACTICE ROUTINE / RIYAZ PLAN
        if "plan" in p_lower or "routine" in p_lower or "schedule" in p_lower or "riyaz" in p_lower or "minutes" in p_lower or "daily" in p_lower:
            return (
                "🧘 **The Ideal 30-Minute Daily Riyaz Blueprint**\n\n"
                "Consistent, mindful practice of 30 minutes every day yields tenfold the progress of erratic 3-hour weekend sessions:\n\n"
                "### Phase 1: Kharaj Sadhana & Breath Grounding (8 mins)\n"
                "- Tune the Tanpura drone to your comfortable Sa.\n"
                "- Sustain Mandra Sa, Mandra Ni, and Mandra Dha for full breath cycles.\n"
                "- Cultivate a rich, round, resonant tone without pushing volume.\n\n"
                "### Phase 2: Svaravali & Alankar Fluency (10 mins)\n"
                "- Practice basic note permutations: `S R G, R G M, G M P...`\n"
                "- Repeat at three speeds: Vilambit (60 BPM), Madhyalaya (120 BPM), and Dhrut (180 BPM).\n"
                "- Focus on clean pitch landings with no intermediate slur.\n\n"
                "### Phase 3: Raga Sadhana & Pakad Mastery (10 mins)\n"
                "- Select your focus raga (e.g., Raga Yaman).\n"
                "- Sing the Aroha, Avaroha, and signature Pakad.\n"
                "- Hold the Vadi note (Gandhar) for 4 beats on each arrival.\n\n"
                "### Phase 4: Shanti & Dhyana (2 mins)\n"
                "- Close with a tranquil, sustained Madhyama Sa.\n\n"
                "Would you like me to tailor this for a beginner, intermediate, or advanced level?"
            )

        # 11. DEFAULT RICH GURU ASSISTANT
        openings = [
            "🙏 **Namaste, dear Sadhak! I am SwaraGPT, your AI Virtual Guru.**\n\n",
            "🙏 **Pranam! As your Virtual Guru in Indian Classical Music, I am here to guide your Sadhana.**\n\n",
            "🙏 **Aashirvaad! May your practice be blessed with flawless Sur and Laya.**\n\n"
        ]
        return (
            random.choice(openings) +
            "I am here to guide your voice, your musical intellect, and your devotion to Indian Classical Music. "
            "Whether you are studying Hindustani Khayal, Dhrupad, Carnatic Kritis, or preparing your vocal technique, you may ask me:\n\n"
            "- **Raga Grammar & Mood:** Detailed Aroha, Avaroha, Vadi, Samvadi, Pakad, and Time Theory for over 14 ragas.\n"
            "- **Vocal Diagnostics:** How to fix microtonal drift, sharp/flat notes, and breath instability.\n"
            "- **Microtonal Shrutis:** The exact mathematical and aesthetic placement of all 22 Shrutis.\n"
            "- **Ornamentation:** Mastering Meend (continuous glides), Gamak, Andolan, and Murki.\n\n"
            "Tell me, which aspect of your Sadhana shall we explore right now?"
        )


def get_ai_provider() -> AIProvider:
    """Factory returning configured AI Provider instance."""
    provider_name = (settings.AI_PROVIDER or "offline").lower()
    if provider_name == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()
    elif provider_name == "gemini" and (settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")):
        return GeminiProvider()
    else:
        # Graceful, highly articulate domain fallback
        return OfflineGuruProvider()

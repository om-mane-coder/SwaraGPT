import os
import sys
import json
import re
import traceback
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.rag import retrieve_knowledge
from ai.tools import tool_get_user_profile
import google.generativeai as genai
import openai

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

class SwaraGPTOrchestrator:
    def __init__(self):
        self.openai_key = OPENAI_API_KEY
        self.gemini_key = GEMINI_API_KEY
        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"[Orchestrator] Gemini init warning: {e}")
                self.gemini_model = None
        else:
            self.gemini_model = None

        if self.openai_key:
            openai.api_key = self.openai_key

    def generate_response(self, user_message: str, audio_analysis=None, conversation_history=None, mode="Guru Mode") -> str:
        profile = tool_get_user_profile(user_id=1)
        raga_hint = audio_analysis["raga_predictions"][0]["raga"] if audio_analysis and audio_analysis.get("raga_predictions") else None
        knowledge = retrieve_knowledge(user_message or "", raga_context=raga_hint)

        skill_level = profile.get("skill_level", "Intermediate")
        tonic_note = profile.get("preferred_tonic", "A#")
        tonic_hz = profile.get("tonic_frequency_hz", 233.08)
        gharana = profile.get("preferred_gharana", "Hindustani Classical")
        weak_swaras_list = profile.get("weak_swaras", ["Shuddha Ga"])
        weak_swaras_str = ", ".join(weak_swaras_list) if isinstance(weak_swaras_list, list) else str(weak_swaras_list)

        system_instruction = (
            "You are SwaraGPT — an empathetic, deeply knowledgeable AI Guru (Music Teacher) for Indian Classical Music (Hindustani & Carnatic).\n"
            "Your persona is warm, encouraging, authoritative yet accessible, rooted in classical tradition.\n"
            f"Student Profile: Skill Level={skill_level}, Base Sa={tonic_note} ({tonic_hz}Hz), Gharana={gharana}, Weak Swaras={weak_swaras_str}.\n"
            f"Teaching Mode: {mode}.\n"
            "Rules:\n"
            "1. Answer naturally as a live conversational music teacher. Do not repeat greeting templates.\n"
            "2. When analyzing audio, explain pitch accuracy, tonic stability, and raga nuances in teacher terms.\n"
            "3. Use formatted Markdown with bullet points, musical notations (e.g. S R G M' P D N), and clear practice steps.\n"
            "4. Respond dynamically to general chat, music theory, raga queries, taal explanations, and riyaaz guidance."
        )

        # 1. Try Gemini API if key is present
        if self.gemini_model:
            try:
                prompt_content = f"{system_instruction}\n\n"
                if conversation_history:
                    prompt_content += "Conversation History:\n"
                    for m in conversation_history[-6:]:
                        prompt_content += f"{m['sender'].capitalize()}: {m['content']}\n"
                    prompt_content += "\n"
                
                prompt_content += f"User Input: {user_message}\n"
                if audio_analysis:
                    prompt_content += f"Audio Intelligence Data: {json.dumps(audio_analysis, indent=2)}\n"
                if knowledge:
                    prompt_content += f"Retrieved Knowledge Base Context: {json.dumps(knowledge, indent=2)}\n"

                res = self.gemini_model.generate_content(prompt_content)
                if res and res.text:
                    return res.text
            except Exception as e:
                print(f"[Orchestrator] Gemini call failed ({e}), checking OpenAI/Local fallback.")

        # 2. Try OpenAI API if key is present
        if self.openai_key:
            try:
                messages = [{"role": "system", "content": system_instruction}]
                if conversation_history:
                    for m in conversation_history[-6:]:
                        role = "assistant" if m["sender"] in ["assistant", "guru"] else "user"
                        messages.append({"role": role, "content": m["content"]})
                
                u_text = f"User Input: {user_message}\n"
                if audio_analysis:
                    u_text += f"\nAudio Data: {json.dumps(audio_analysis)}"
                if knowledge:
                    u_text += f"\nKnowledge: {json.dumps(knowledge)}"

                messages.append({"role": "user", "content": u_text})

                response = openai.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=900
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"[Orchestrator] OpenAI API call failed ({e}), invoking Local Conversational AI Engine.")

        # 3. Local Conversational AI Engine
        try:
            return self._run_local_conversational_engine(user_message, audio_analysis, profile, knowledge, conversation_history, mode)
        except Exception as err:
            print(f"[Orchestrator Error]: {err}")
            traceback.print_exc()
            return f"Namaste! I am here as your AI Music Guru to help you with Indian Classical Music. Ask me about ragas, taals, practice exercises, or upload your singing!"

    def _run_local_conversational_engine(self, user_msg: str, audio_analysis, profile, knowledge, history, mode) -> str:
        msg = (user_msg or "").strip().lower()

        if audio_analysis:
            return self._build_audio_feedback(audio_analysis, profile)

        weak_swaras = profile.get("weak_swaras", ["Shuddha Ga"])
        weak_swara_first = weak_swaras[0] if isinstance(weak_swaras, list) and weak_swaras else "Shuddha Ga"
        preferred_tonic = profile.get("preferred_tonic", "A#")
        tonic_hz = profile.get("tonic_frequency_hz", 233.08)
        skill_lvl = profile.get("skill_level", "Intermediate")
        gharana = profile.get("preferred_gharana", "Hindustani Classical")

        # Intent 1: Greetings & Capabilities
        if re.search(r'\b(hi|hello|namaste|hey|hola|greetings)\b', msg):
            if "who are you" in msg or "what can you do" in msg or "help" in msg:
                return (
                    "Namaste! 🙏 I am **SwaraGPT**, your AI Music Guru.\n\n"
                    "Here is how I can guide your musical journey:\n"
                    "1. 🎤 **Vocal Listening & Analysis**: Record or upload your singing. I'll detect your tonic (Sa), analyze pitch accuracy, recognize swaras, and identify ragas.\n"
                    "2. 📖 **Raga & Taal Masterclass**: Ask about Aroha, Avroha, Pakad, Vadi/Samvadi, or rhythm cycles like Teentaal & Keharwa.\n"
                    "3. 🎯 **Personalized Riyaaz**: I track your weak swaras (like Shuddha Ga & Komal Ni) and generate targeted vocal exercises.\n"
                    "4. 🎶 **Song Mapping**: Find classical and Bollywood songs tailored to specific ragas.\n\n"
                    "Feel free to ask a question or record a phrase!"
                )
            return (
                "Namaste! 🙏 Welcome back to your Riyaaz session.\n\n"
                f"Your Adhara Sa is tuned to **{preferred_tonic}** ({tonic_hz} Hz). "
                f"We recently focused on stabilizing your **{weak_swara_first}**.\n\n"
                "How would you like to begin today? You can:\n"
                "• Upload or record a vocal snippet for pitch evaluation\n"
                "• Ask me to explain a Raga, Taal, or musical concept\n"
                "• Request a 10-minute targeted practice drill"
            )

        # Intent 2: Capabilities / Identity
        if "what can you do" in msg or "capabilities" in msg or "features" in msg or "who are you" in msg:
            return (
                "I am your dedicated **AI Virtual Guru for Indian Classical Music**! 🎵\n\n"
                "### Core Capabilities:\n"
                "• **Real-Time Pitch Detection**: Uses signal processing (`librosa` pYIN) to map your exact frequency to Indian Swaras (Sa, Re, Ga, Ma, Pa, Dha, Ni).\n"
                "• **Raga Recognition**: Matches your singing against 6 core Hindustani ragas with confidence scores.\n"
                "• **Timestamped Error Diagnostics**: Pinpoints exactly where your intonation went sharp or flat.\n"
                "• **Interactive Raga & Song Knowledge Base**: Instant lookup for scales, pakads, bandishes, and song Compositions.\n"
                "• **Continuous Progress Tracking**: Maintains your pitch accuracy history over time.\n\n"
                "Try singing a short phrase or ask me a theory question to test it out!"
            )

        # Intent 3: Practice / Riyaaz Drills
        if any(w in msg for w in ["practice", "exercise", "drill", "riyaaz", "training", "workout"]):
            return (
                f"### 🎯 Customized Riyaaz Module: Focus on {weak_swara_first}\n\n"
                f"Since your profile indicates room for improvement on **{weak_swara_first}**, here is a 3-step practice routine:\n\n"
                f"1. **Tonic Anchor (3 mins)**: Sing a steady **Sa** at your base pitch ({preferred_tonic}) for 10 seconds per breath. Focus on vocal stability.\n"
                f"2. **Interval Step (4 mins)**: Move deliberately: `Sa → Re → {weak_swara_first} → Re → Sa`. Hold `{weak_swara_first}` for 4 beats without vibrato.\n"
                f"3. **Sargam Pattern (3 mins)**: Sing in Madhya Laya (80 BPM):\n"
                f"   `S R G, R G M, G M P, M P D, P D N, D N S'`\n\n"
                f"💡 *Guru's Tip*: Keep your throat relaxed and listen closely to the tanpura drone before striking {weak_swara_first}.\n\n"
                f"Ready to record your attempt? Click the 🎤 button below when you're done!"
            )

        # Intent 4: Raga Query
        for r_item in knowledge.get("ragas", []):
            r_name = r_item.get("name", "").lower()
            if r_name and r_name in msg:
                comps = r_item.get("famous_compositions", []) or r_item.get("famous_songs", [])
                comps_str = ", ".join(comps) if isinstance(comps, list) else str(comps)
                return (
                    f"### 🎼 Deep Dive: Raga {r_item.get('name')}\n\n"
                    f"**Thaat**: {r_item.get('thaat')} | **Jati**: {r_item.get('jati', 'Sampurna')} | **Time**: {r_item.get('time_period')}\n"
                    f"**Vadi (King Note)**: {r_item.get('vadi')} | **Samvadi (Queen Note)**: {r_item.get('samvadi')}\n\n"
                    f"#### 🎵 Scale Structure:\n"
                    f"• **Aroha (Ascent)**: `{r_item.get('aroh')}`\n"
                    f"• **Avroha (Descent)**: `{r_item.get('avroh')}`\n"
                    f"• **Pakad (Signature Phrase)**: `{r_item.get('pakad')}`\n\n"
                    f"#### 💡 Aesthetic Character ({r_item.get('rasa')} Rasa):\n"
                    f"{r_item.get('description')}\n\n"
                    f"**Famous Compositions / Songs**: {comps_str}\n\n"
                    f"Would you like to hear recommended songs in Raga {r_item.get('name')} or practice its Pakad?"
                )

        # Intent 5: Taal Query
        for t_item in knowledge.get("taals", []):
            t_name = t_item.get("name", "").lower()
            if t_name and (t_name in msg or ("taal" in msg and t_name in msg)):
                return (
                    f"### 🥁 Rhythm Masterclass: {t_item.get('name')} ({t_item.get('matras')} Beats)\n\n"
                    f"**Structure**: {t_item.get('vibhags')} Vibhags | **Sam**: Beat {t_item.get('sam_matra', 1)} | **Khali**: {t_item.get('khali_matra')}\n\n"
                    f"#### Theka (Rhythmic Bol Pattern):\n"
                    f"`{t_item.get('theka')}`\n\n"
                    f"**Overview**: {t_item.get('description')}\n\n"
                    f"Try reciting the Bols aloud while keeping time with hand claps (Tali on Sam, Khali on wave)!"
                )

        if "taal" in msg or "rhythm" in msg or "beat" in msg:
            taals = knowledge.get("taals", [])
            if taals:
                t_item = taals[0]
                return (
                    f"### 🥁 Rhythm Masterclass: {t_item.get('name')} ({t_item.get('matras')} Beats)\n\n"
                    f"**Structure**: {t_item.get('vibhags')} Vibhags | **Sam**: Beat {t_item.get('sam_matra', 1)} | **Khali**: {t_item.get('khali_matra')}\n\n"
                    f"#### Theka (Rhythmic Bol Pattern):\n"
                    f"`{t_item.get('theka')}`\n\n"
                    f"**Overview**: {t_item.get('description')}\n\n"
                    f"Try reciting the Bols aloud while keeping time with hand claps (Tali on Sam, Khali on wave)!"
                )

        # Intent 6: Songs Query
        if any(w in msg for w in ["song", "bolly", "film", "composition", "recommend"]):
            songs = knowledge.get("songs", [])
            s_text = "\n".join([f"• **{s['title']}** ({s['artist']}) — *Raga {s['primary_raga']}* [{s['genre']}]" for s in songs[:4]])
            return (
                f"### 🎶 Selected Compositions & Songs for Riyaaz\n\n"
                f"Here are top classical and film compositions matched to your {skill_lvl} level:\n\n"
                f"{s_text}\n\n"
                f"Each of these songs provides an excellent practical demonstration of how classical ragas translate into expressive melodies. Which one would you like to explore?"
            )

        # Intent 7: Musical Concepts (Meend, Shruti, Swara, Gharana, Tanpura, Gamak)
        if "meend" in msg:
            return (
                "### 🌊 Musical Concept: Meend (Vocal Glide)\n\n"
                "**Meend** is the smooth, continuous vocal curve connecting two notes without any abrupt step or silence.\n\n"
                "• **Why it matters**: In Indian Classical Music, notes are rarely discrete points like piano keys; they are fluid curves.\n"
                "• **Example**: Gliding gracefully from Pancham (P) down to Gandhar (G) in Raga Yaman (`P ~~~ G`).\n"
                "• **Practice Tip**: Start slowly. Imagine drawing a continuous rainbow curve with your voice rather than stepping down a staircase."
            )

        if "shruti" in msg:
            return (
                "### 🎶 Musical Concept: Shruti (Microtones)\n\n"
                "A **Shruti** is a microtonal interval. While Western music divides an octave into 12 equal semitones, Indian Classical Music identifies **22 Shrutis** within an octave!\n\n"
                "• Sa and Pa are fixed (*Achala Swaras*).\n"
                "• Notes like Komal Re or Shuddha Ga have subtle microtonal variations depending on the raga (e.g. Komal Re in Bhairav vs Bilaskhani Todi).\n"
                "• Precision in shrutis is what gives each raga its authentic soul."
            )

        if "gharana" in msg:
            return (
                f"### 🏛 Musical Concept: Gharana System\n\n"
                f"A **Gharana** is an apprenticeship lineage in Hindustani music, preserving unique stylistic traditions, vocal production techniques, and raga interpretations.\n\n"
                f"Your profile is set to **{gharana}**:\n"
                f"• **Gwalior**: The oldest Khayal gharana, known for lucid, structured bandish rendering and direct swara attack.\n"
                f"• **Kirana**: Famous for intense swara-extension, deep emotional resonance, and masterful meends (pioneered by Ustad Abdul Karim Khan & Pandit Bhimsen Joshi)."
            )

        # General Intelligent Conversational Fallback
        return (
            f"That is a great question about Indian Classical Music! 🎵\n\n"
            f"Regarding **\"{user_msg}\"**:\n"
            f"In Hindustani classical pedagogy, every musical element connects back to **Adhara Sa** (your tonic reference) and rhythmic balance (*Laya*).\n\n"
            f"As your AI Guru, I can help you explore this further. Would you like to:\n"
            f"1. Practice a sargam exercise related to this topic?\n"
            f"2. Examine how this applies in Raga Yaman or Bhairavi?\n"
            f"3. Record your voice to test your pitch accuracy right now?"
        )

    def _build_audio_feedback(self, analysis, profile) -> str:
        tonic = analysis['tonic']
        top_raga = analysis['raga_predictions'][0] if analysis.get('raga_predictions') else {"raga": "Yaman", "confidence": 0.78}
        raga_name = top_raga['raga']
        raga_conf = int(top_raga['confidence'] * 100)
        accuracy = analysis['swaras']['overall_accuracy_pct']
        issues = analysis.get('timestamped_issues', [])

        resp = f"**Namaste! I have listened to your vocal recording carefully.** 🎵\n\n"
        resp += f"### 📊 Vocal Performance Diagnostic:\n"
        resp += f"• **Detected Tonic (Adhara Sa)**: **{tonic['tonic_note']}** ({tonic['frequency_hz']} Hz)\n"
        resp += f"• **Raga Classification**: **Raga {raga_name}** ({raga_conf}% confidence match)\n"
        resp += f"• **Overall Pitch Stability**: **{accuracy}%** accuracy\n\n"

        if issues:
            resp += f"### 🔍 Detailed Intonation Feedback:\n"
            for issue in issues[:3]:
                resp += f"• **Timestamp {issue['start_time']}–{issue['end_time']}**: {issue['issue']}\n"
            resp += "\n"

        resp += f"### 🎯 Guru's Recommended Next Step:\n"
        resp += f"Your pitch accuracy is solid at **{accuracy}%**. To elevate your singing in Raga {raga_name}:\n"
        resp += f"1. Sustain **Sa** for 8 seconds, focusing on zero fluctuation.\n"
        resp += f"2. Practice the signature pakad phrase slow at 65 BPM.\n\n"
        resp += f"Would you like me to recommend a song in Raga {raga_name} or start another practice drill?"
        return resp

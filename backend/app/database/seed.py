"""
SwaraGPT - Database Seeding Module
Seeds essential Ragas, Taals, Concepts, Structured Exercises, and Demo accounts.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserProfile, UserRole, ExperienceLevel, Tradition
from app.models.raga import RagaMaster, TaalMaster, PracticeExercise, ConceptMaster
from app.models.session import PracticeSession, AudioAnalysis
from app.services.auth_service import hash_password


async def seed_database(db: AsyncSession):
    """Seed comprehensive initial dataset if tables are empty."""
    print("🌱 Checking and seeding SwaraGPT database...")

    # 1. Seed Demo Users
    res = await db.execute(select(User).where(User.email == "guru@swaragpt.ai"))
    demo_guru = res.scalar_one_or_none()
    if not demo_guru:
        demo_guru = User(
            name="Pandit Swara (Master Guru)",
            email="guru@swaragpt.ai",
            password_hash=hash_password("password123"),
            role="teacher",
            bio="Senior Vocalist and AI Musicology Research Master.",
        )
        db.add(demo_guru)
        await db.flush()

        guru_profile = UserProfile(
            user_id=demo_guru.id,
            experience_level="Advanced",
            tradition="Hindustani",
            preferred_tonic="C3",
            preferred_tonic_hz=130.81,
            daily_goal_minutes=45,
            target_ragas=["Yaman", "Darbari Kanada", "Marwa", "Todi"],
            strong_swaras=["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"],
            weak_swaras=[],
            current_streak_days=42,
            total_practice_minutes=1850,
        )
        db.add(guru_profile)

    res_student = await db.execute(select(User).where(User.email == "student@swaragpt.ai"))
    demo_student = res_student.scalar_one_or_none()
    if not demo_student:
        demo_student = User(
            name="Om Mane",
            email="student@swaragpt.ai",
            password_hash=hash_password("password123"),
            role="student",
            bio="Dedicated Indian Classical vocal enthusiast & computational music student.",
        )
        db.add(demo_student)
        await db.flush()

        student_profile = UserProfile(
            user_id=demo_student.id,
            experience_level="Intermediate",
            tradition="Hindustani",
            preferred_tonic="C3",
            preferred_tonic_hz=130.81,
            daily_goal_minutes=25,
            target_ragas=["Yaman", "Bhupali", "Bhairav", "Bageshri"],
            strong_swaras=["Sa", "Pa", "Shuddha Re"],
            weak_swaras=["Shuddha Ga", "Komal Ni", "Tivra Ma"],
            current_streak_days=7,
            total_practice_minutes=340,
        )
        db.add(student_profile)

    await db.commit()

    # 2. Seed Ragas (14 Major Ragas from IEEE Paper & Curriculum)
    ragas_catalog = [
        {
            "name": "Yaman",
            "aliases": "Kalyan, Yaman-Kalyan",
            "tradition": "Hindustani",
            "thaat": "Kalyan",
            "aaroha": "N. R G M' P D N S'",
            "avaroha": "S' N D P M' G R S",
            "vadi": "Ga",
            "samvadi": "Ni",
            "pakad": "N. R G, M' P, D N S', R' S' N D P, M' G R S",
            "chalan": "Starts on Mandra Nishad. Sa is often omitted in direct ascent (N. R G M'). Tivra Ma defines the mood.",
            "jati": "Audav-Sampurna",
            "time_period": "Evening (6:00 PM – 9:00 PM)",
            "season": "All Seasons",
            "rasa": "Shanta (Peaceful), Sringara (Romantic), Bhakti (Devotional)",
            "swara_set": ["Sa", "Shuddha Re", "Shuddha Ga", "Tivra Ma", "Pa", "Shuddha Dha", "Shuddha Ni"],
            "important_swaras": ["Ga", "Ni", "Tivra Ma", "Re"],
            "avoided_swaras": ["Shuddha Ma"],
            "famous_compositions": ["Eri Aali Piya Bina (Drut Teentaal)", "Jiya Re Jiya Na Maane"],
            "description": "Yaman is the fundamental evening raga in Hindustani music. It employs all Shuddha notes with Tivra Madhyam (M').",
            "practice_guidance": "Focus on the transition from Mandra Ni to Re and Ga without sounding Sa. Ensure Tivra Ma is distinct and does not dip to Shuddha Ma."
        },
        {
            "name": "Bhairav",
            "aliases": "King of Morning Ragas",
            "tradition": "Hindustani",
            "thaat": "Bhairav",
            "aaroha": "S r G M P d N S'",
            "avaroha": "S' N d P M G r S",
            "vadi": "d (Komal Dha)",
            "samvadi": "r (Komal Re)",
            "pakad": "G M d d P, M G r r S",
            "chalan": "Slow oscillation (Andolan) on Komal Rishabh (r) and Komal Dhaivat (d) touching upper microtones.",
            "jati": "Sampurna-Sampurna",
            "time_period": "Dawn / Early Morning (4:00 AM – 7:00 AM)",
            "season": "All Seasons",
            "rasa": "Raudra (Solemn), Bhakti (Devotional), Serenity",
            "swara_set": ["Sa", "Komal Re", "Shuddha Ga", "Shuddha Ma", "Pa", "Komal Dha", "Shuddha Ni"],
            "important_swaras": ["Komal Re", "Komal Dha", "Shuddha Ma"],
            "avoided_swaras": [],
            "famous_compositions": ["Jago Mohan Pyare (Ektaal)", "Mero Man Anand Bhaeyo"],
            "description": "Bhairav is the majestic dawn raga characterized by trembling andolan oscillations on Komal Re and Komal Dha.",
            "practice_guidance": "Do not treat Komal Re as a flat static note. Practice the slow oscillation (Andolan) starting from Sa gently rising toward Re and descending."
        },
        {
            "name": "Bhairavi",
            "aliases": "Queen of Ragas",
            "tradition": "Hindustani",
            "thaat": "Bhairavi",
            "aaroha": "S r g M P d n S'",
            "avaroha": "S' n d P M g r S",
            "vadi": "Ma",
            "samvadi": "Sa",
            "pakad": "M P d n P, g M r S, r S N. d. S",
            "chalan": "Uses all 4 komal swaras (r, g, d, n). Often rendered with subtle touches of all 12 notes in semi-classical thumri.",
            "jati": "Sampurna-Sampurna",
            "time_period": "Early Morning (4:00 AM – 7:00 AM) or Concert Finale",
            "season": "All Seasons",
            "rasa": "Karuna (Pathos), Bhakti (Devotion), Viraha (Longing)",
            "swara_set": ["Sa", "Komal Re", "Komal Ga", "Shuddha Ma", "Pa", "Komal Dha", "Komal Ni"],
            "important_swaras": ["Ma", "Sa", "Komal Dha", "Komal Ga"],
            "avoided_swaras": [],
            "famous_compositions": ["Bhavani Dayani (Teentaal)", "Jamuna Ke Teer (Thumri)"],
            "description": "Bhairavi is universally loved and revered. In modern concerts, it is almost always sung as the concluding piece.",
            "practice_guidance": "Maintain clear microtonal distinction between Komal Ga (g) and Komal Re (r). Practice smooth meend from Pa to Komal Ga."
        },
        {
            "name": "Bhupali",
            "aliases": "Bhoop, Mohanam (Carnatic)",
            "tradition": "Hindustani",
            "thaat": "Kalyan",
            "aaroha": "S R G P D S'",
            "avaroha": "S' D P G R S",
            "vadi": "Ga",
            "samvadi": "Dha",
            "pakad": "G R S D. S R G, P G, D P G R S",
            "chalan": "Strict pentatonic scale omitting Ma and Ni completely (Varjit). Rich meends between Pa-Ga and Dha-Pa.",
            "jati": "Audav-Audav",
            "time_period": "First Prahar of Night (7:00 PM – 9:00 PM)",
            "season": "All Seasons",
            "rasa": "Shanta, Bhakti, Grand Simplicity",
            "swara_set": ["Sa", "Shuddha Re", "Shuddha Ga", "Pa", "Shuddha Dha"],
            "important_swaras": ["Ga", "Dha", "Pa"],
            "avoided_swaras": ["Ma", "Ni"],
            "famous_compositions": ["Jab Se Tumhen Dekha", "Pratham Sumir Shri Ganesh"],
            "description": "A tranquil 5-note evening raga. Its simple scale conceals profound depth in phrasing and breath control.",
            "practice_guidance": "Never touch Ma or Ni even as a passing kan-swar. Execute clean glides from Pa down to Ga."
        },
        {
            "name": "Bageshri",
            "aliases": "Bageshwari",
            "tradition": "Hindustani",
            "thaat": "Kafi",
            "aaroha": "S n. D. S, M g M, D n S'",
            "avaroha": "S' n D, M P g, M R S",
            "vadi": "Ma",
            "samvadi": "Sa",
            "pakad": "D. N. S, M, g M D, n D M, g M R S",
            "chalan": "Madhyam is the resting hub. Pa is absent in ascent and lightly touched in descent in phrase (M P g M).",
            "jati": "Audav-Sampurna",
            "time_period": "Late Night (9:00 PM – 12:00 AM)",
            "season": "All Seasons",
            "rasa": "Sringara (Romantic longing), Karuna",
            "swara_set": ["Sa", "Shuddha Re", "Komal Ga", "Shuddha Ma", "Pa", "Shuddha Dha", "Komal Ni"],
            "important_swaras": ["Ma", "Komal Ga", "Dha"],
            "avoided_swaras": ["Pa in Aroha"],
            "famous_compositions": ["Kaun Gat Bhayi", "Ja Re Kagadwa"],
            "description": "A deeply evocative night raga of romantic separation and yearning, anchored firmly on Madhyam.",
            "practice_guidance": "Rest frequently on Shuddha Ma. When descending through Pa, make it subtle and connected to Komal Ga."
        },
        {
            "name": "Darbari Kanada",
            "aliases": "Darbari",
            "tradition": "Hindustani",
            "thaat": "Asavari",
            "aaroha": "S R g M P d n S'",
            "avaroha": "S' d n P, M P g, M R S",
            "vadi": "Re",
            "samvadi": "Pa",
            "pakad": "g M R S, d. n. P. M. P. S",
            "chalan": "Heavy andolan on Ati-Komal Ga and Ati-Komal Dha in Mandra and Madhya saptaks.",
            "jati": "Sampurna-Sampurna",
            "time_period": "Deep Midnight (12:00 AM – 3:00 AM)",
            "season": "Winter / All Seasons",
            "rasa": "Veera (Majestic, Grave), Adbhuta",
            "swara_set": ["Sa", "Shuddha Re", "Komal Ga", "Shuddha Ma", "Pa", "Komal Dha", "Komal Ni"],
            "important_swaras": ["Re", "Pa", "Ati-Komal Ga", "Ati-Komal Dha"],
            "avoided_swaras": [],
            "famous_compositions": ["Anokha Ladla", "Nain So Nain Milaye"],
            "description": "Created by Mian Tansen for Emperor Akbar's royal court. Majestic, grave, requiring deep vocal resonance.",
            "practice_guidance": "Practice sustained notes in Mandra Saptak (lower octave). Do not sing brisk taans; focus on heavy, slow meends."
        },
        {
            "name": "Malkauns",
            "aliases": "Hindolam (Carnatic)",
            "tradition": "Hindustani",
            "thaat": "Bhairavi",
            "aaroha": "S g M d n S'",
            "avaroha": "S' n d M g M g S",
            "vadi": "Ma",
            "samvadi": "Sa",
            "pakad": "g M d M g, M g S, d. n. S",
            "chalan": "Omits Re and Pa entirely. Meditative midnight ascent through komal notes.",
            "jati": "Audav-Audav",
            "time_period": "Midnight (12:00 AM – 3:00 AM)",
            "season": "Winter",
            "rasa": "Veera, Shanta, Meditative",
            "swara_set": ["Sa", "Komal Ga", "Shuddha Ma", "Komal Dha", "Komal Ni"],
            "important_swaras": ["Ma", "Komal Ga", "Komal Dha"],
            "avoided_swaras": ["Re", "Pa"],
            "famous_compositions": ["Tu Hai Ek Ram", "Paga Lagana De"],
            "description": "Ancient meditative pentatonic raga omitting Rishabh and Pancham. Invokes deep spiritual introspectiveness.",
            "practice_guidance": "Never introduce even a trace of Re or Pa. Focus on accurate tuning of Komal Ga and Komal Dha relative to Sa."
        },
        {
            "name": "Kafi",
            "aliases": "Kharaharapriya (Carnatic counterpart)",
            "tradition": "Hindustani",
            "thaat": "Kafi",
            "aaroha": "S R g M P D n S'",
            "avaroha": "S' n D P M g R S",
            "vadi": "Pa",
            "samvadi": "Sa",
            "pakad": "S R R g g M M P, M P D n D P",
            "chalan": "Uses Komal Ga and Komal Ni. Widely used for Hori, Dhamar, and spring folklore.",
            "jati": "Sampurna-Sampurna",
            "time_period": "Midnight / Anytime during Spring/Holi",
            "season": "Spring (Basant)",
            "rasa": "Sringara, Joyous, Celebratory",
            "swara_set": ["Sa", "Shuddha Re", "Komal Ga", "Shuddha Ma", "Pa", "Shuddha Dha", "Komal Ni"],
            "important_swaras": ["Pa", "Sa", "Shuddha Re", "Komal Ga"],
            "avoided_swaras": [],
            "famous_compositions": ["Aaj Biraj Mein Hori Re Rasiya"],
            "description": "The foundation of the Kafi thaat, famous for festive semi-classical compositions and brisk, playful rhythm.",
            "practice_guidance": "Practice pairing notes in alankars (SS RR gg MM). Keep the mood lively and energetic."
        },
        {
            "name": "Todi",
            "aliases": "Miyan Ki Todi, Shubhapantuvarali (Carnatic)",
            "tradition": "Hindustani",
            "thaat": "Todi",
            "aaroha": "S r g M' P d N S'",
            "avaroha": "S' N d P M' g r S",
            "vadi": "d (Komal Dha)",
            "samvadi": "g (Komal Ga)",
            "pakad": "r g r S, M' g r g, d M' d N S'",
            "chalan": "Uses Komal Re, Komal Ga, Tivra Ma, and Komal Dha. Deeply intense microtones.",
            "jati": "Sampurna-Sampurna",
            "time_period": "Late Morning (9:00 AM – 12:00 PM)",
            "season": "All Seasons",
            "rasa": "Karuna, Vairagya (Renunciation), Deep Longing",
            "swara_set": ["Sa", "Komal Re", "Komal Ga", "Tivra Ma", "Pa", "Komal Dha", "Shuddha Ni"],
            "important_swaras": ["Komal Dha", "Komal Ga", "Tivra Ma"],
            "avoided_swaras": ["Shuddha Ma"],
            "famous_compositions": ["Langar Kankariya Ji Na Maro"],
            "description": "One of the most complex morning ragas. Known for its distinct microtonal Gandhar and intense emotional weight.",
            "practice_guidance": "Komal Ga in Todi is pitched very low (Ati-Komal). Do not sing it at equal temperament 300 cents."
        },
        {
            "name": "Marwa",
            "aliases": "Gamanashrama (Carnatic)",
            "tradition": "Hindustani",
            "thaat": "Marwa",
            "aaroha": "N. r G M' D N r' S'",
            "avaroha": "r' N D M' G r S",
            "vadi": "r (Komal Re)",
            "samvadi": "D (Shuddha Dha)",
            "pakad": "D N r' N D, M' D G r, N. r S",
            "chalan": "Pancham is strictly forbidden (Varjit). Sa is avoided and creates an unresolved twilight tension.",
            "jati": "Shadav-Shadav",
            "time_period": "Dusk / Sunset (Sandhi Prakash 5:00 PM – 7:00 PM)",
            "season": "All Seasons",
            "rasa": "Unease, Awe, Intense Spiritual Yearning",
            "swara_set": ["Sa", "Komal Re", "Shuddha Ga", "Tivra Ma", "Shuddha Dha", "Shuddha Ni"],
            "important_swaras": ["Komal Re", "Shuddha Dha", "Tivra Ma"],
            "avoided_swaras": ["Pa"],
            "famous_compositions": ["Bangri Mori Morodi"],
            "description": "A profound sunset raga omitting Pancham and creating haunting suspense between Komal Re and Shuddha Dha.",
            "practice_guidance": "Never hit Pa. Minimize landing on Sa; hover on Komal Re and Shuddha Dha to maintain Marwa's tension."
        },
        {
            "name": "Desh",
            "aliases": "Des",
            "tradition": "Hindustani",
            "thaat": "Khamaj",
            "aaroha": "S R M P N S'",
            "avaroha": "S' n D P M G R S",
            "vadi": "Re",
            "samvadi": "Pa",
            "pakad": "R M P N, S' R' n D P, M G R S",
            "chalan": "Uses Shuddha Ni in ascent and Komal Ni in descent. Ga is omitted in ascent.",
            "jati": "Audav-Sampurna",
            "time_period": "Second Prahar of Night (9:00 PM – 12:00 AM) or Monsoon",
            "season": "Monsoon (Varsha)",
            "rasa": "Deshbhakti (Patriotism), Sringara, Joyful Rain",
            "swara_set": ["Sa", "Shuddha Re", "Shuddha Ga", "Shuddha Ma", "Pa", "Shuddha Dha", "Shuddha Ni", "Komal Ni"],
            "important_swaras": ["Re", "Pa", "Shuddha Ni in Aroha", "Komal Ni in Avaroha"],
            "avoided_swaras": ["Ga in Aroha"],
            "famous_compositions": ["Vande Mataram (National Song)", "Gori Tore Nain Kajar Bin Kaare"],
            "description": "The quintessential national raga of India, immortalized in Vande Mataram. Warm, uplifting, and poetic.",
            "practice_guidance": "Ensure Shuddha Ni is sharp and resolute in ascent, while Komal Ni in descent descends smoothly to Dha and Pa."
        },
        {
            "name": "Hamsadhwani",
            "aliases": "Hansadhwani",
            "tradition": "Carnatic / Hindustani Adopted",
            "thaat": "Bilawal (originated from Shankarabharanam)",
            "aaroha": "S R G P N S'",
            "avaroha": "S' N P G R S",
            "vadi": "Sa",
            "samvadi": "Pa",
            "pakad": "G P N S', R' N P G R S",
            "chalan": "Pentatonic scale omitting Ma and Dha. Bright, auspicious, celebratory prayer melody.",
            "jati": "Audav-Audav",
            "time_period": "Anytime / Concert Inception",
            "season": "All Seasons",
            "rasa": "Joyous, Auspicious, Invocation to Lord Ganesha",
            "swara_set": ["Sa", "Shuddha Re", "Shuddha Ga", "Pa", "Shuddha Ni"],
            "important_swaras": ["Sa", "Pa", "Shuddha Ni", "Shuddha Ga"],
            "avoided_swaras": ["Ma", "Dha"],
            "famous_compositions": ["Vatapi Ganapatim Bhajeham", "Laagi Lagan Sakhi"],
            "description": "Created by Ramaswami Dikshitar in Carnatic music and warmly embraced by Hindustani musicians.",
            "practice_guidance": "Sing with crisp articulation and brisk energy. Omitting Ma and Dha gives large, bright intervals (Ga to Pa, Pa to Ni)."
        }
    ]

    for r_data in ragas_catalog:
        res = await db.execute(select(RagaMaster).where(RagaMaster.name == r_data["name"]))
        existing = res.scalar_one_or_none()
        if not existing:
            raga = RagaMaster(**r_data)
            db.add(raga)

    await db.commit()

    # 3. Seed Taals
    taals_catalog = [
        {"name": "Teentaal", "matras": 16, "vibhags": "4+4+4+4", "theka": "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha", "sam_matra": 1, "khali_matra": "9th Matra", "description": "The king of Hindustani rhythmic cycles. 16 beats across 4 equal vibhags."},
        {"name": "Keherwa", "matras": 8, "vibhags": "4+4", "theka": "Dha Ge Na Ti | Na Ka Dhi Na", "sam_matra": 1, "khali_matra": "5th Matra", "description": "Extremely versatile 8-beat cycle for semi-classical, bhajans, and folk music."},
        {"name": "Dadra", "matras": 6, "vibhags": "3+3", "theka": "Dha Dhi Na | Dha Tu Na", "sam_matra": 1, "khali_matra": "4th Matra", "description": "Lively 6-beat cycle common in Thumri, Dadra, and Ghazals."},
        {"name": "Jhaptal", "matras": 10, "vibhags": "2+3+2+3", "theka": "Dhi Na | Dhi Dhi Na | Ti Na | Dhi Dhi Na", "sam_matra": 1, "khali_matra": "6th Matra", "description": "Asymmetric 10-beat cycle favored in serious vilambit and madhya laya bandishes."},
        {"name": "Ektaal", "matras": 12, "vibhags": "2+2+2+2+2+2", "theka": "Dhin Dhin | Dhage Tirakita | Tu Na | Kat Ta | Dhage Tirakita | Dhi Na", "sam_matra": 1, "khali_matra": "3rd & 7th Matras", "description": "12-beat classical meter suited for both contemplative slow and dazzling fast tempos."},
        {"name": "Rupak", "matras": 7, "vibhags": "3+2+2", "theka": "Tin Tin Na | Dhi Na | Dhi Na", "sam_matra": 1, "khali_matra": "1st Matra (Khali on Sam)", "description": "Unique 7-beat cycle where the Sam begins on a gentle wave (Khali)."}
    ]

    for t_data in taals_catalog:
        res = await db.execute(select(TaalMaster).where(TaalMaster.name == t_data["name"]))
        existing = res.scalar_one_or_none()
        if not existing:
            db.add(TaalMaster(**t_data))

    await db.commit()

    # 4. Seed Structured Practice Exercises
    exercises_catalog = [
        {
            "title": "Adhara Sa Stability & Kharaj Sadhana",
            "category": "Sa stability",
            "difficulty": "Beginner",
            "duration_minutes": 5,
            "target_notes": "Sa (Continuous Hold)",
            "instructions": "Inhale deeply from diaphragm. Sustain tonic Sa steadily for 6 to 8 seconds per breath without vibrato or tremolo. Observe the pitch graph to keep cents within ±10 cents."
        },
        {
            "title": "Basic Saptak Alankar (Shuddha Swara Ascent)",
            "category": "Alankar",
            "difficulty": "Beginner",
            "duration_minutes": 5,
            "target_notes": "Sa Re Ga Ma Pa Dha Ni Sa'",
            "instructions": "Sing each note with clear vowel 'Aakar'. Move upwards in steady tempo, then descend accurately back to Mandra Sa."
        },
        {
            "title": "Jodi Swara Alankar (Coupled Notes)",
            "category": "Alankar",
            "difficulty": "Beginner",
            "duration_minutes": 5,
            "target_notes": "Sa-Sa Re-Re Ga-Ga Ma-Ma Pa-Pa Dha-Dha Ni-Ni Sa'-Sa'",
            "instructions": "Double-strike each note cleanly with equal breath pressure to train pitch memory and vocal muscle agility."
        },
        {
            "title": "Raga Yaman Signature Pakad Drill",
            "category": "Pakad",
            "difficulty": "Intermediate",
            "duration_minutes": 8,
            "target_notes": "Ni. Re Ga, Ma' Dha Pa, Re Ga Re Sa",
            "instructions": "Practice Yaman's signature phrase. Do not touch Sa directly on the ascent; start from Mandra Ni to Re and Ga. Keep Tivra Ma high and clear."
        },
        {
            "title": "Bhupali Pentatonic Meend Exercise",
            "category": "Alankar",
            "difficulty": "Intermediate",
            "duration_minutes": 7,
            "target_notes": "Ga Re Sa Dha., Sa Re Ga, Pa Ga, Dha Pa Ga",
            "instructions": "Execute smooth continuous glides between Pa and Ga. Do not break sound between notes; ensure Ma and Ni remain completely silent."
        },
        {
            "title": "Bhairav Andolan & Microtonal Control",
            "category": "Aakar",
            "difficulty": "Advanced",
            "duration_minutes": 10,
            "target_notes": "Sa r r S, G M d d P, M G r r S",
            "instructions": "Sing slow deliberate microtonal oscillations (Andolan) on Komal Re and Komal Dha. Observe whether cent deviation stays within the 22-shruti Chandovati and Madanti boundary."
        }
    ]

    for ex_data in exercises_catalog:
        res = await db.execute(select(PracticeExercise).where(PracticeExercise.title == ex_data["title"]))
        existing = res.scalar_one_or_none()
        if not existing:
            db.add(PracticeExercise(**ex_data))

    await db.commit()

    # 5. Seed Historical Practice Sessions for Demo Dashboard
    res = await db.execute(select(PracticeSession).where(PracticeSession.user_id == demo_student.id))
    existing_sessions = res.scalars().all()
    if not existing_sessions:
        now = datetime.now(timezone.utc)
        sample_sessions = [
            {
                "id": "session_demo_001",
                "user_id": demo_student.id,
                "raga_name": "Yaman",
                "duration_seconds": 320.0,
                "overall_score": 76.5,
                "pitch_accuracy": 74.0,
                "swara_accuracy": 78.0,
                "shruti_accuracy": 72.0,
                "raga_accuracy": 82.0,
                "tonic_stability": 76.0,
                "tonic_used_hz": 130.81,
                "tonic_swara": "C3",
                "feedback_summary": "Good initial Sa stability, but Shuddha Ga drifted +34 cents sharp during transitions.",
                "created_at": now - timedelta(days=6)
            },
            {
                "id": "session_demo_002",
                "user_id": demo_student.id,
                "raga_name": "Yaman",
                "duration_seconds": 410.0,
                "overall_score": 79.2,
                "pitch_accuracy": 78.5,
                "swara_accuracy": 81.0,
                "shruti_accuracy": 76.5,
                "raga_accuracy": 84.0,
                "tonic_stability": 80.0,
                "tonic_used_hz": 130.81,
                "tonic_swara": "C3",
                "feedback_summary": "Tivra Ma showed confident execution. Work on holding Ni without premature slide to Sa.",
                "created_at": now - timedelta(days=4)
            },
            {
                "id": "session_demo_003",
                "user_id": demo_student.id,
                "raga_name": "Bhupali",
                "duration_seconds": 480.0,
                "overall_score": 83.8,
                "pitch_accuracy": 85.0,
                "swara_accuracy": 84.5,
                "shruti_accuracy": 81.0,
                "raga_accuracy": 88.0,
                "tonic_stability": 84.0,
                "tonic_used_hz": 130.81,
                "tonic_swara": "C3",
                "feedback_summary": "Excellent pentatonic discipline. Pa-Ga meend showed 88% stability. Sustained Sa was rock steady.",
                "created_at": now - timedelta(days=2)
            },
            {
                "id": "session_demo_004",
                "user_id": demo_student.id,
                "raga_name": "Yaman",
                "duration_seconds": 540.0,
                "overall_score": 86.4,
                "pitch_accuracy": 87.5,
                "swara_accuracy": 88.0,
                "shruti_accuracy": 84.0,
                "raga_accuracy": 91.0,
                "tonic_stability": 88.0,
                "tonic_used_hz": 130.81,
                "tonic_swara": "C3",
                "feedback_summary": "Remarkable improvement on Pakad phrasing! Intonation remained Sur (in tune) across 82% of frames.",
                "created_at": now - timedelta(hours=5)
            }
        ]

        for s_data in sample_sessions:
            sess = PracticeSession(**s_data)
            db.add(sess)
        await db.commit()

    print(" Database seeded with Ragas, Taals, Exercises, and Demo Accounts successfully!")

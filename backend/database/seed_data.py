from database.models import Base, User, UserProfile, Raga, Song, Taal, Concept, Conversation, Message
from database.db import SessionLocal, engine

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Seed Default User & Profile
    if not db.query(User).first():
        user = User(id=1, username='student', name='Om Mane')
        db.add(user)
        db.commit()
        
        profile = UserProfile(
            user_id=user.id,
            skill_level='Intermediate',
            preferred_tonic='A#',
            tonic_frequency_hz=233.08,
            preferred_gharana='Hindustani Classical (Gwalior / Kirana)',
            preferred_language='Hindi/English',
            strong_swaras=['Sa', 'Pa', 'Shuddha Re', 'Shuddha Dha'],
            weak_swaras=['Shuddha Ga', 'Komal Ni', 'Tivra Ma'],
            current_ragas=['Yaman', 'Bhairavi', 'Bhoopali', 'Bageshri'],
            completed_ragas=['Kafi', 'Bhupali Basic Alankars'],
            total_practice_minutes=180,
            overall_accuracy_pct=82.4
        )
        db.add(profile)
        db.commit()
        print("[Seed] Created default User and Profile.")

    # 2. Seed Ragas
    ragas_data = [
        {
            "name": "Yaman",
            "aliases": "Kalyan, Yaman-Kalyan",
            "thaat": "Kalyan",
            "aroh": "N. R G M' P D N S'",
            "avroh": "S' N D P M' G R S",
            "pakad": "N. R G, M' P, D N S', R' S' N D P, M' G R S",
            "chalan": "Starts on Mandra Ni. Sa is frequently omitted in direct ascent (N. R G M'). Tivra Ma is the defining feature.",
            "vadi": "Ga",
            "samvadi": "Ni",
            "jati": "Audav-Sampurna (or Sampurna)",
            "time_period": "First Prahar of Night (6:00 PM – 9:00 PM)",
            "season": "All Seasons",
            "rasa": "Shanta (Peaceful), Bhakti (Devotional), Sringara (Romantic)",
            "swara_set": ["Sa", "Shuddha Re", "Shuddha Ga", "Tivra Ma", "Pa", "Shuddha Dha", "Shuddha Ni"],
            "important_swaras": ["Ga", "Ni", "Tivra Ma", "Re"],
            "avoided_swaras": ["Shuddha Ma"],
            "similar_ragas": ["Yaman-Kalyan", "Shuddha Kalyan", "Chhayanat"],
            "famous_compositions": ["Eri Aali Piya Bina (Drut Teentaal)", "Jiya Re Jiya Na Maane"],
            "famous_songs": ["Aap Ki Ankhon Mein Kuch (Ghar)", "Chhod De Sari Duniya (Saraswatichandra)", "Ehsan Tera Hoga Mujh Par (Junglee)"],
            "description": "Yaman is one of the most fundamental night ragas in Hindustani classical music. It utilizes all Shuddha swaras with Tivra Ma (M'). Sa is skipped in aroha (N. R G)."
        },
        {
            "name": "Bhairavi",
            "aliases": "Queen of Ragas",
            "thaat": "Bhairavi",
            "aroh": "S r g m P d n S'",
            "avroh": "S' n d P m g r S",
            "pakad": "m P d n P, g m r S, r S N. d. S",
            "chalan": "All four komal swaras (r, g, d, n) are used. Traditionally rendered at conclusion of classical concerts.",
            "vadi": "Ma",
            "samvadi": "Sa",
            "jati": "Sampurna-Sampurna",
            "time_period": "Early Morning (4:00 AM – 7:00 AM) / Concert Concluding Raga",
            "season": "All Seasons",
            "rasa": "Karuna (Pathos), Bhakti (Devotional), Viraha (Longing)",
            "swara_set": ["Sa", "Komal Re", "Komal Ga", "Shuddha Ma", "Pa", "Komal Dha", "Komal Ni"],
            "important_swaras": ["Ma", "Sa", "Komal Dha", "Komal Ga"],
            "avoided_swaras": [],
            "similar_ragas": ["Bilaskhani Todi", "Asavari", "Malkauns"],
            "famous_compositions": ["Bhavani Dayani (Drut Teentaal)", "Jamuna Ke Teer (Thumri)"],
            "famous_songs": ["Mile Sur Mera Tumhara (Opening)", "Laga Jayegi Dil Ko (Woh Kaun Thi)", "Babul Gora Abhinandan"],
            "description": "Bhairavi is an extremely expressive morning raga containing all four flat notes (komal re, ga, dha, ni). It is revered as the Queen of Ragas."
        },
        {
            "name": "Bhoopali",
            "aliases": "Bhup, Mohanam (Carnatic)",
            "thaat": "Kalyan",
            "aroh": "S R G P D S'",
            "avroh": "S' D P G R S",
            "pakad": "G R S D. S R G, P G, D P G R S",
            "chalan": "Pentatonic scale. Ma and Ni are completely avoided (Varjit). Deep meend between P and G, D and P.",
            "vadi": "Gandhar (Ga)",
            "samvadi": "Dhaivat (Dha)",
            "jati": "Audav-Audav",
            "time_period": "First Prahar of Night (7:00 PM – 9:00 PM)",
            "season": "All Seasons",
            "rasa": "Bhakti (Devotional), Shanta (Calm)",
            "swara_set": ["Sa", "Shuddha Re", "Shuddha Ga", "Pa", "Shuddha Dha"],
            "important_swaras": ["Ga", "Dha", "Pa"],
            "avoided_swaras": ["Ma", "Ni"],
            "similar_ragas": ["Deshkar (Morning counterpart)", "Shuddha Kalyan"],
            "famous_compositions": ["Jab Se Tumhen Dekha (Teentaal)", "Pratham Sumir Shri Ganesh"],
            "famous_songs": ["Pankh Hote To Ud Aati Re", "Jyoti Kalash Jhalke", "Dekha Ek Khwab To Ye Silsile"],
            "description": "Bhoopali is a major pentatonic raga omitting Ma and Ni. It shares the same notes as Carnatic Mohanam and is widely used for initial vocal training."
        },
        {
            "name": "Bageshri",
            "aliases": "Bageshwari",
            "thaat": "Kafi",
            "aroh": "S n. D. S, m g M, D n S'",
            "avroh": "S' n D, m P g, m R S",
            "pakad": "D. N. S, m, g m D, n D m, g m R S",
            "chalan": "Komal Ga and Komal Ni are used. Pa is avoided in aroha and used weakly in avroh in phrase (m P g m).",
            "vadi": "Madhyam (Ma)",
            "samvadi": "Shadja (Sa)",
            "jati": "Audav-Sampurna",
            "time_period": "Late Night (Second Prahar of Night, 9:00 PM – 12:00 AM)",
            "season": "Monsoon / All Seasons",
            "rasa": "Sringara (Romantic longing), Karuna (Melancholy)",
            "swara_set": ["Sa", "Shuddha Re", "Komal Ga", "Shuddha Ma", "Pa", "Shuddha Dha", "Komal Ni"],
            "important_swaras": ["Ma", "Sa", "Komal Ga", "Dha"],
            "avoided_swaras": ["Pa in Aroha"],
            "similar_ragas": ["Rageshri", "Kafi", "Bhimpalasi"],
            "famous_compositions": ["Shail Sutaa Aandandita (Jhaptal)", "Ja Re Kagadva (Teentaal)"],
            "famous_songs": ["Radha Na Bole Na Bole", "Jaago Mohan Pyare", "Pucho Na Kaise Maine Rain Beetaayi"],
            "description": "Bageshri is a romantic late-night raga depicting emotional longing. It emphasizes Madhyam and uses Komal Ga and Komal Ni with delicate meends."
        },
        {
            "name": "Bhairav",
            "aliases": "King of Morning Ragas",
            "thaat": "Bhairav",
            "aroh": "S r G m P d N S'",
            "avroh": "S' N d P m G r S",
            "pakad": "G m d d P, m G r r S",
            "chalan": "Heavy oscillation (Andolan) on Komal Re (r) and Komal Dha (d). Majestic and solemn atmosphere.",
            "vadi": "Dhaivat (d)",
            "samvadi": "Rishabh (r)",
            "jati": "Sampurna-Sampurna",
            "time_period": "Daybreak / Dawn (4:00 AM – 6:00 AM)",
            "season": "All Seasons",
            "rasa": "Awe (Adbhut), Devotion (Bhakti), Serenity",
            "swara_set": ["Sa", "Komal Re", "Shuddha Ga", "Shuddha Ma", "Pa", "Komal Dha", "Shuddha Ni"],
            "important_swaras": ["Komal Dha", "Komal Re", "Shuddha Ma"],
            "avoided_swaras": [],
            "similar_ragas": ["Ramkali", "Ahir Bhairav", "Nat Bhairav"],
            "famous_compositions": ["Jago Mohan Pyare (Ektaal)", "Mero Man Anand Bhaeyo"],
            "famous_songs": ["Jaago Mohan Pyare (Seema)", "Man Re Tu Kahe Na Dheer Dhare"],
            "description": "Bhairav is the fundamental dawn raga featuring Komal Re and Komal Dha with slow, deliberate oscillations (Andolan)."
        },
        {
            "name": "Malkauns",
            "aliases": "Hindolam (Carnatic)",
            "thaat": "Bhairavi",
            "aroh": "S g m d n S'",
            "avroh": "S' n d m g m g S",
            "pakad": "g m d m g, m g S, d. n. S",
            "chalan": "Pentatonic raga omitting Re and Pa completely. Deep, meditative, and grave late-night raga.",
            "vadi": "Madhyam (Ma)",
            "samvadi": "Shadja (Sa)",
            "jati": "Audav-Audav",
            "time_period": "Midnight (12:00 AM – 3:00 AM)",
            "season": "Winter / All Seasons",
            "rasa": "Veera (Heroic / Meditative), Shanta",
            "swara_set": ["Sa", "Komal Ga", "Shuddha Ma", "Komal Dha", "Komal Ni"],
            "important_swaras": ["Ma", "Komal Ga", "Komal Dha"],
            "avoided_swaras": ["Re", "Pa"],
            "similar_ragas": ["Chandrakauns", "Surdasi Malhar"],
            "famous_compositions": ["Paga Lagana De (Drut Teentaal)", "Tu Hai Ek Ram"],
            "famous_songs": ["Man Tarpat Hari Darshan Ko Aaj", "Tu Pyar Ka Sagar Hai", "Aaye Sur Ke Panchhi"],
            "description": "Malkauns is a deep, majestic midnight raga omitting Re and Pa. It demands great breath control and microtonal accuracy on Komal Ga and Dha."
        }
    ]

    for r_data in ragas_data:
        if not db.query(Raga).filter_by(name=r_data['name']).first():
            raga = Raga(**r_data)
            db.add(raga)
    db.commit()
    print("[Seed] Seeded Raga Database.")

    # 3. Seed Songs
    songs_data = [
        {
            "title": "Aap Ki Ankhon Mein Kuch",
            "artist": "Kishore Kumar, Lata Mangeshkar",
            "composer": "R. D. Burman",
            "film_or_album": "Ghar (1978)",
            "genre": "Film Song / Semi-Classical",
            "language": "Hindi",
            "primary_raga": "Yaman",
            "taal": "Keharwa",
            "tempo_bpm": 92,
            "classical_notes": "Employs classic Yaman phrasing with prominent Tivra Ma and Shuddha Ga-Ni movement. Excellent for practicing Yaman transitions.",
            "youtube_or_audio_url": "https://www.youtube.com/watch?v=example1",
            "difficulty_level": "Beginner-Intermediate"
        },
        {
            "title": "Eri Aali Piya Bina",
            "artist": "Pandit Jasraj / Classical Tradition",
            "composer": "Traditional Bandish",
            "film_or_album": "Hindustani Bandishes",
            "genre": "Classical Bandish",
            "language": "Braj Bhasha",
            "primary_raga": "Yaman",
            "taal": "Teentaal",
            "tempo_bpm": 120,
            "classical_notes": "Standard Chhota Khayal bandish in Drut Teentaal. Starts on the 9th Matra (Khali). Perfect for sargam and taan practice.",
            "youtube_or_audio_url": "https://www.youtube.com/watch?v=example2",
            "difficulty_level": "Intermediate"
        },
        {
            "title": "Jaago Mohan Pyare",
            "artist": "Lata Mangeshkar",
            "composer": "Salil Chowdhury",
            "film_or_album": "Jagte Raho (1956)",
            "genre": "Film Song / Devotional",
            "language": "Hindi",
            "primary_raga": "Bhairav",
            "taal": "Keharwa",
            "tempo_bpm": 80,
            "classical_notes": "Beautiful dawn devotional song built on Raga Bhairav with gentle oscillation on Komal Re and Dha.",
            "youtube_or_audio_url": "https://www.youtube.com/watch?v=example3",
            "difficulty_level": "Intermediate"
        },
        {
            "title": "Man Tarpat Hari Darshan Ko Aaj",
            "artist": "Mohammed Rafi",
            "composer": "Naushad",
            "film_or_album": "Baiju Bawra (1952)",
            "genre": "Devotional / Classical Film",
            "language": "Hindi",
            "primary_raga": "Malkauns",
            "taal": "Keharwa",
            "tempo_bpm": 76,
            "classical_notes": "Iconic Indian film song showcasing pure Raga Malkauns with deep vocal resonance on Komal Ga and Komal Dha.",
            "youtube_or_audio_url": "https://www.youtube.com/watch?v=example4",
            "difficulty_level": "Advanced"
        },
        {
            "title": "Radha Na Bole Na Bole",
            "artist": "Lata Mangeshkar",
            "composer": "C. Ramchandra",
            "film_or_album": "Azad (1955)",
            "genre": "Semi-Classical",
            "language": "Hindi",
            "primary_raga": "Bageshri",
            "taal": "Teentaal",
            "tempo_bpm": 104,
            "classical_notes": "Masterpiece in Raga Bageshri capturing the graceful Madhyam and Komal Ga phrasing.",
            "youtube_or_audio_url": "https://www.youtube.com/watch?v=example5",
            "difficulty_level": "Intermediate"
        }
    ]

    for s_data in songs_data:
        if not db.query(Song).filter_by(title=s_data['title']).first():
            song = Song(**s_data)
            db.add(song)
    db.commit()
    print("[Seed] Seeded Song Database.")

    # 4. Seed Taals
    taals_data = [
        {
            "name": "Teentaal",
            "matras": 16,
            "vibhags": "4+4+4+4",
            "theka": "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha",
            "sam_matra": 1,
            "khali_matra": "9th Matra",
            "description": "The king of Hindustani rhythmic cycles. 16 beats divided into 4 equal sections with Sam on beat 1 and Khali on beat 9."
        },
        {
            "name": "Keharwa",
            "matras": 8,
            "vibhags": "4+4",
            "theka": "Dha Ge Na Ti | Na Ka Dhi Na",
            "sam_matra": 1,
            "khali_matra": "5th Matra",
            "description": "Extremely popular 8-beat rhythm used extensively in light classical, ghazals, bhajans, and folk music."
        },
        {
            "name": "Dadra",
            "matras": 6,
            "vibhags": "3+3",
            "theka": "Dha Dhi Na | Dha Tu Na",
            "sam_matra": 1,
            "khali_matra": "4th Matra",
            "description": "Lively 6-beat cycle common in Thumri, Dadra, Ghazals, and folk compositions."
        },
        {
            "name": "Jhaptal",
            "matras": 10,
            "vibhags": "2+3+2+3",
            "theka": "Dhi Na | Dhi Dhi Na | Ti Na | Dhi Dhi Na",
            "sam_matra": 1,
            "khali_matra": "6th Matra",
            "description": "Asymmetric 10-beat cycle widely used in Khayal compositions and vilambit/madhya laya performances."
        },
        {
            "name": "Ektaal",
            "matras": 12,
            "vibhags": "2+2+2+2+2+2",
            "theka": "Dhin Dhin | Dhage Tirakita | Tu Na | Kat Ta | Dhage Tirakita | Dhi Na",
            "sam_matra": 1,
            "khali_matra": "3rd and 7th Matras",
            "description": "12-beat rhythmic structure used both in slow (Vilambit) and fast (Drut) classical Khayal renditions."
        }
    ]

    for t_data in taals_data:
        if not db.query(Taal).filter_by(name=t_data['name']).first():
            taal = Taal(**t_data)
            db.add(taal)
    db.commit()
    print("[Seed] Seeded Taal Database.")

    # 5. Seed Music Concepts
    concepts_data = [
        {
            "title": "Swara",
            "category": "Foundations",
            "definition": "A musical note or pitch in Indian Classical Music. The seven basic swaras (Saptak) are Shadja (Sa), Rishabh (Re), Gandhar (Ga), Madhyam (Ma), Pancham (Pa), Dhaivat (Dha), and Nishad (Ni).",
            "examples": "Sa, Re, Ga, Ma, Pa, Dha, Ni",
            "importance_for_learners": "Understanding relative swara positions from base Sa is the fundamental step in vocal tuning."
        },
        {
            "title": "Shruti",
            "category": "Foundations",
            "definition": "The microtonal intervals in Indian Classical Music. An octave (Saptak) is divided into 22 distinct shrutis.",
            "examples": "Komal Re has 2 shrutis; Sa and Pa are fixed (Achala).",
            "importance_for_learners": "Shruti accuracy determines whether your singing sounds authentic and expressive rather than tempered."
        },
        {
            "title": "Adhara Shadja (Sa Tonic)",
            "category": "Foundations",
            "definition": "The baseline reference frequency selected by a vocalist. Unlike Western fixed pitch (A4=440Hz), Sa can be tuned to any comfortable frequency (e.g. A#, C#, D).",
            "examples": "Male singers often select C# or D (138Hz–146Hz); Female singers often select G# or A# (207Hz–233Hz).",
            "importance_for_learners": "All swara calculations are relative to your chosen Sa tonic."
        },
        {
            "title": "Meend",
            "category": "Ornamentation",
            "definition": "A smooth, continuous glissando or vocal glide from one swara to another without breaking the sound.",
            "examples": "Gliding from Pa down to Ga in Raga Yaman (P ~~~ G).",
            "importance_for_learners": "Meend gives Indian Classical vocal singing its distinctive emotional grace and continuity."
        },
        {
            "title": "Pakad",
            "category": "Structure",
            "definition": "The catchphrase or signature musical movement that instantly identifies a raga.",
            "examples": "N. R G, M' P, D N S' for Raga Yaman.",
            "importance_for_learners": "Mastering the pakad ensures you hit the raga's identity accurately during improvisations."
        }
    ]

    for c_data in concepts_data:
        if not db.query(Concept).filter_by(title=c_data['title']).first():
            concept = Concept(**c_data)
            db.add(concept)
    db.commit()
    print("[Seed] Seeded Music Concepts Database.")

    # 6. Seed Sample Conversation & Messages
    if not db.query(Conversation).first():
        conv = Conversation(
            id="conv_default_001",
            user_id=1,
            title="Riyaaz & Yaman Swara Practice",
            mode="Guru Mode"
        )
        db.add(conv)
        db.commit()

        msg1 = Message(
            id="msg_001",
            conversation_id=conv.id,
            sender="assistant",
            content="Namaste Om! Welcome to SwaraGPT. I am your persistent AI Music Guru. Upload your vocal recording, record your practice, or ask any question about Indian Classical Music.",
            message_type="text"
        )
        db.add(msg1)
        db.commit()
        print("[Seed] Seeded default Conversation.")

    db.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()

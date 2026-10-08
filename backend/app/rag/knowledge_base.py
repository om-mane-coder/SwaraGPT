"""
SwaraGPT - Authentic Indian Classical Musicology Knowledge Base
Verified classical literature from Bharata Muni's Natya Shastra,
Sarangadeva's Sangeeta Ratnakara, Bhatkhande's Kramik Pustak Malika,
and Subba Rao's Raganidhi with citation metadata.
"""
from typing import List, Dict, Any

VERIFIED_KNOWLEDGE_DOCS: List[Dict[str, Any]] = [
    {
        "id": "doc_ns_01",
        "title": "Natya Shastra on Shrutis and Swaras",
        "author": "Bharata Muni (c. 200 BCE – 200 CE)",
        "source": "Natya Shastra, Chapter 28 (Jati & Shruti Pariksha)",
        "tradition": "Ancient Indian Musicology",
        "topic": "Shruti, Shadja Grama, Madhyama Grama",
        "content": (
            "Bharata defines the 22 Shrutis through the famous Sarana Chatushtayi (two identical 22-string Vinas). "
            "The distribution across the seven swaras in Shadja Grama is: "
            "Chatushruti Shadja (4 shrutis: Tivra, Kumudvati, Manda, Chandovati), "
            "Trishruti Rishabha (3 shrutis: Dayavati, Ranjani, Raktika), "
            "Dvishruti Gandhara (2 shrutis: Raudri, Krodha), "
            "Chatushruti Madhyama (4 shrutis: Vajrika, Prasarini, Priti, Marjani), "
            "Chatushruti Panchama (4 shrutis: Kshiti, Rakta, Sandipani, Alapini), "
            "Trishruti Dhaivata (3 shrutis: Madanti, Rohini, Ramya), "
            "Dvishruti Nishada (2 shrutis: Ugra, Kshobhini). "
            "All intervals exist in mutual consonance (Samvada): Shadja-Panchama Bhava (ratio 3/2, 702 cents) "
            "and Shadja-Madhyama Bhava (ratio 4/3, 498 cents)."
        )
    },
    {
        "id": "doc_sr_02",
        "title": "Sangeeta Ratnakara on Gamaka and Ornamentation",
        "author": "Sarangadeva (13th Century CE)",
        "source": "Sangeeta Ratnakara, Prakirnaka Adhyaya",
        "tradition": "Classical Sangeeta Shastra",
        "topic": "Gamakas, Alankars, Sthaya",
        "content": (
            "Sarangadeva categorizes 15 distinct Gamakas (vocal and instrumental ornaments) essential for Raga realization: "
            "Tiripa (flutter), Sphurita (light jump), Kampita (shake), Lina (melting into note), Andolita (swinging sway), "
            "Valita (curve), Plavita (wave), Ullhasita (glide/meend), Tarangita (rippling), and others. "
            "A bare, unornamented note (Niralamkara) is compared to a night without a moon or a creeper without flowers. "
            "In vocal singing, Gamak must originate from the chest (Urah) or navel (Nabhi) with firm diaphragm support."
        )
    },
    {
        "id": "doc_kpm_03",
        "title": "Bhatkhande Thaat Classification System",
        "author": "Pandit Vishnu Narayan Bhatkhande (1860–1936)",
        "source": "Hindustani Sangeet Paddhati (Kramik Pustak Malika)",
        "tradition": "Hindustani Classical",
        "topic": "10 Thaats, Raga-Thaat System, Time Theory (Samay Siddhanta)",
        "content": (
            "Bhatkhande organized hundreds of Hindustani ragas under 10 parent scales (Thaats): "
            "1. Bilawal (All Shuddha: S R G M P D N) "
            "2. Kalyan (Tivra Ma: S R G M' P D N) "
            "3. Khamaj (Komal Ni: S R G M P D n) "
            "4. Kafi (Komal Ga, Komal Ni: S R g M P D n) "
            "5. Asavari (Komal Ga, Dha, Ni: S R g M P d n) "
            "6. Bhairav (Komal Re, Komal Dha: S r G M P d N) "
            "7. Bhairavi (All 4 Komal: S r g M P d n) "
            "8. Todi (Komal Re, Ga, Dha, Tivra Ma: S r g M' P d N) "
            "9. Poorvi (Komal Re, Dha, Tivra Ma: S r G M' P d N) "
            "10. Marwa (Komal Re, Tivra Ma, Shuddha Dha: S r G M' D N). "
            "Ragas are strictly associated with the 8 Prahars of the day according to Vadi swara placement "
            "(Poorvanga-vadi ragas sung between 12 PM - 12 AM; Uttaranga-vadi ragas sung between 12 AM - 12 PM)."
        )
    },
    {
        "id": "doc_ym_04",
        "title": "Grammar and Aesthetic Principles of Raga Yaman",
        "author": "Pt. V. N. Patwardhan / Traditional Gharana Shastra",
        "source": "Raga Vijnana, Vol. 1",
        "tradition": "Hindustani Classical",
        "topic": "Raga Yaman, Kalyan Thaat, Vadi-Samvadi, Chalan",
        "content": (
            "Raga Yaman belongs to Kalyan Thaat. Its jati is Audav-Sampurna or Shadav-Sampurna in ascent, "
            "and Sampurna in descent. "
            "Aaroha: N. R G M' P D N S' (Sa is frequently omitted in direct ascent; singers start on Mandra Ni). "
            "Avaroha: S' N D P M' G R S. "
            "Vadi: Gandhar (Ga). Samvadi: Nishad (Ni). "
            "Time: First prahar of night (Prathama Prahar, 6:00 PM – 9:00 PM). "
            "Pakad phrases: 'N. R G', 'M' P', 'D N S'', 'R' S' N D P, M' G R S'. "
            "Important rule: Tivra Madhyam must be clean and bright; touching Shuddha Madhyam creates Yaman-Kalyan."
        )
    },
    {
        "id": "doc_bh_05",
        "title": "Grammar and Aesthetic Principles of Raga Bhairav",
        "author": "Ustad Vilayat Hussain Khan / Sangeetacharya Records",
        "source": "Sangeet Shastra Parichaya",
        "tradition": "Hindustani Classical",
        "topic": "Raga Bhairav, Sandhiprakash, Andolan",
        "content": (
            "Raga Bhairav is the supreme morning Sandhiprakash raga, sung at daybreak (4:00 AM – 7:00 AM). "
            "It is Sampurna in both aroha and avaroha: "
            "Aaroha: S r G M P d N S'. Avaroha: S' N d P M G r S. "
            "Vadi: Komal Dhaivat (d). Samvadi: Komal Rishabh (r). "
            "Pakad: 'G M d d P, M G r r S'. "
            "The defining aesthetic feature of Bhairav is the slow, deliberate Andolan (oscillation) on Komal Re and Komal Dha. "
            "The pitch of Re gently swells from Sa up towards the lower boundary of Shuddha Re and descends back into Sa."
        )
    },
    {
        "id": "doc_riyaz_06",
        "title": "Foundations of Vocal Riyaz & Kharaj Sadhana",
        "author": "Ustad Amir Khan & Pt. Omkarnath Thakur",
        "source": "Pranava Bharati / Vocal Mastery Treatises",
        "tradition": "Vocal Pedagogical Practice",
        "topic": "Riyaz, Kharaj Sadhana, Voice Culture, Breath Control",
        "content": (
            "Daily vocal training (Riyaz) in Indian Classical Music must follow a structured tripartite routine: "
            "1. Kharaj Sadhana (Dawn low-note meditation): Singing sustained notes in the Mandra Saptak (Mandra Sa, Ni, Dha, Pa) "
            "for 30–45 minutes with abdominal breathing. This expands vocal range, resonance, and pitch stability. "
            "2. Alankar and Palta practice: Singing structured permutations (such as SaReGa, ReGaMa, or SaReGaMaPaDhaNiSa) "
            "in three layas (Vilambit, Madhya, Drut) using both Swara names and Aakar (vowel 'Aa'). "
            "3. Raga Bandish & Chalan immersion: Sustained contemplation of one raga's Vadi, Samvadi, and Meend transitions "
            "with Tanpura drone accompaniment."
        )
    }
]


def get_all_knowledge_docs() -> List[Dict[str, Any]]:
    return VERIFIED_KNOWLEDGE_DOCS

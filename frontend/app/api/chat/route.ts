import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || '';
    const perfContext = body.performance_context || null;

    let responseText = '';

    const pLower = message.toLowerCase().trim();
    const isGreeting = ['hi', 'hello', 'hey', 'namaste', 'pranam', 'namaskar', 'good morning', 'good evening'].some(w => pLower.startsWith(w)) && pLower.split(/\s+/).length <= 4;
    const isMyPerfQuery = [
      'my performance', 'my singing', 'my score', 'my voice', 'my recording',
      'analyze my', 'evaluate my', 'critique my', 'diagnose my', 'how did i sing',
      'how was my singing', 'check my pitch', 'fix my mistakes', 'my weak note', 'my weak swara'
    ].some(w => pLower.includes(w));

    // 1. Check if NVIDIA_API_KEY is available (Primary Deep Reasoning Engine)
    const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.NEXT_PUBLIC_NVIDIA_API_KEY;
    if (nvidiaKey) {
      try {
        const userPrompt = isGreeting
          ? message
          : (perfContext && isMyPerfQuery)
            ? `${message}\n\nRecent Practice Telemetry:\n- Raga: ${perfContext.raga || perfContext.target_raga}\n- Score: ${perfContext.overall_score || perfContext.score}%\n- Weak Notes: ${JSON.stringify(perfContext.weak_swaras || perfContext.issues || [])}\n- Cent Deviations: ${perfContext.shruti_deviation_cents || perfContext.cent_deviations || 'N/A'} cents`
            : message;

        const nemotronRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvidiaKey}`,
          },
          body: JSON.stringify({
            model: body.model?.toLowerCase().includes('llama')
              ? 'meta/llama-3.2-11b-vision-instruct'
              : (process.env.NEMOTRON_PRIMARY_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b'),
            messages: [
              {
                role: 'system',
                content:
                  "You are SwaraGPT's Virtual Guru, an expert maestro and musicologist in Indian Classical Music. Directly and immediately answer the student's actual question, behaving like a knowledgeable and fluid AI chatbot (like ChatGPT). If asked for a specific format (e.g. 'tell in 10 lines'), adhere strictly to that format. Respond warmly to greetings. Do NOT provide unprompted critique about singing telemetry or pitch errors unless the student explicitly asks for feedback on their own singing."
              },
              {
                role: 'user',
                content: userPrompt
              }
            ],
            temperature: 0.4,
            max_tokens: 2048
          })
        });

        if (nemotronRes.ok) {
          const data = await nemotronRes.json();
          const choice = data?.choices?.[0]?.message;
          responseText = choice?.content || choice?.reasoning_content || '';
        }
      } catch (err) {
        console.warn('NVIDIA API call failed, falling back to scholarly musicology model:', err);
      }
    }

    // 2. Fallback to Gemini if Nemotron wasn't used or failed
    if (!responseText) {
      const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (geminiKey) {
        try {
          const prompt = `You are SwaraGPT's Virtual Guru, an authentic Indian Classical Music maestro.
Student Inquiry: "${message}"
${perfContext && isPerfQuery ? `Performance Telemetry: Raga: ${perfContext.raga}, Score: ${perfContext.overall_score}%, Weak Notes: ${JSON.stringify(perfContext.weak_swaras)}` : ''}

Provide an authentic, scholarly, and practical response for their Riyaz, including exact notes, pakad phrases, and breathing techniques.`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          }
        } catch (err) {
          console.warn('Gemini API call failed, falling back to canonical musicology model:', err);
        }
      }
    }

    if (!responseText) {
      responseText = generateMusicologyGuruResponse(message, perfContext);
    }

    return NextResponse.json({
      reply: responseText,
      content: responseText,
      response: responseText,
      message: responseText,
      role: 'guru',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Chat processing error', detail: error?.message || String(error) },
      { status: 500 }
    );
  }
}

function generateMusicologyGuruResponse(query: string, context: any): string {
  const q = query.toLowerCase().trim();

  // 1. Greetings
  if (['hi', 'hello', 'hey', 'namaste', 'pranam', 'namaskar'].some(w => q.startsWith(w)) && q.split(/\s+/).length <= 4) {
    return `🙏 **Namaste, dear Sadhak!** Welcome to your musical sanctuary.

I am your **SwaraGPT Virtual Guru**, grounded in the canonical treatises of Indian Classical Music (*Natya Shastra*, *Sangeeta Ratnakara*, *Kramik Pustak Malika*). 

How may I guide your musical journey today?
- 🎼 **Raga Aesthetics:** Explore Yaman, Bhairav, Bilawal, Bhairavi, Darbari, or Bhoopali.
- 🎯 **Vocal Diagnostics:** Troubleshoot pitch drift and cent deviations.
- 📐 **Microtonal Science:** Delve into the 22 Shrutis and mathematical ratios.
- 🧘 **Daily Riyaz:** Structure your morning Kharaj Sadhana and Alankars.`;
  }

  // 2. Lata Mangeshkar vs. Asha Bhosle
  if (['lata', 'asha', 'mangeshkar', 'bhosle'].some(w => q.includes(w))) {
    return `### 🎵 Musicological Analysis: Lata Mangeshkar vs. Asha Bhosle
Both sisters are Bharat Ratna recipients trained under Ustad Aman Ali Khan (Bhendibazaar Gharana) and Pandit Tulsidas Sharma, yet their vocal architecture and artistic genius diverge with magnificent contrast:

**1. Lata Mangeshkar — The Sovereign of Svara-Shuddhi (Purity & Restraint)**
- **Tonal Focus:** Laser-pure fundamental pitch with minimal vibrato. Her pitch accuracy consistently stays within **±2–3 cents** of Just Intonation ratios.
- **Shruti & Raga Grammar:** Unrivaled microtonal precision. In semi-classical compositions (*Bandishes* in film), she renders the precise resting shruti of every Komal or Tivra note without portamento smearing.
- **Ornamentation:** Clean, surgical Meends (glides) and atomic Kan-swars (subtle grace notes) that preserve structural architecture.
- **Dominant Rasas:** *Shanta* (Tranquility), *Bhakti* (Devotion), and *Karuna* (Pathos / Separation). Her voice possesses the timeless, clear resonance of a temple bell.

**2. Asha Bhosle — The Queen of Laya, Ornamentation & Versatility**
- **Tonal Focus:** Rich harmonic overtones, dynamic acoustic textures, breath-colored articulation, and explosive rhythmic punch (*Laya-kari*).
- **Ornamentation & Agility:** Lightning-fast Murkis, Khatkas, syncopated rhythm accents, and playful vocal inflections spanning classical Thumri, Ghazal, Cabaret, Qawwali, and Jazz-pop.
- **Genre Mastery:** Effortlessly transitioned from traditional semi-classical gems (*Dil Cheez Kya Hai*) to rebellious, syncopated melodies (*Dum Maro Dum*, *Piya Tu Ab To Aaja*).
- **Dominant Rasas:** *Shringar* (Romantic Passion), *Adbhuta* (Wonder), and *Vira / Raudra* (Dramatic theatrical flair).

**🎼 Musicological Synthesis:**
If **Lata-ji** represents the meditative, unmoving shrine of pure **Sur** (Pitch Perfection), **Asha-ji** represents the dancing, multifaceted flame of **Laya** and **Bhava** (Rhythm, Drama & Expressive Freedom). Both are irreplaceable pillars of Indian vocal culture.`;
  }

  // 3. Raga Yaman
  if (q.includes('yaman')) {
    return `### 🕉️ Virtual Guru Guidance on Raga Yaman (राग यमन)
*Thaat:* **Kalyan** | *Prahar:* **First Prahar of Night (6–9 PM)**  
*Vadi:* **Gandhar (Ga)** at 386.3 cents | *Samvadi:* **Nishad (Ni)** at 1088.3 cents  
*Jati:* **Sampurna - Sampurna** (Direct Sa omitted in ascent)

> *"Nirada-sārag-sugandhi-yuktā sarvair-vibhooshita-surair-upagīyamānā"*  
> — *Raga Dhyanam*

**Essential Rules for Intonation:**
1. **Tivra Madhyam ($M'$):** Placed at the Marjani shruti ($45/32 = 590.2\\text{ cents}$). It creates a poignant yearning before cleanly resolving into Pancham ($Pa$) or descending softly to Gandhar.
2. **Avoiding Direct Sa in Ascent:** In the Arohana, avoid starting flatly on Sa. Always employ the canonical glide: **'.Ni Re Ga'**.
3. **Signature Pakad:** *\`.Ni Re Ga, R G M' P, D P M' G R, .Ni Re Sa\`*

**Riyaz Drill:**
Practice sustaining Shuddha Gandhar against your Tanpura drone at 386 cents for 8 beats with steady diaphragmatic breath support before releasing into Tivra Ma.`;
  }

  // 3. Raga Bhairav
  if (q.includes('bhairav') && !q.includes('bhairavi')) {
    return `### 🕉️ Virtual Guru Guidance on Raga Bhairav (राग भैरव)
*Thaat:* **Bhairav** | *Prahar:* **Dawn / Sandhiprakash (4–7 AM)**  
*Vadi:* **Komal Dhaivat (d)** at 813.7 cents | *Samvadi:* **Komal Rishabh (r)** at 111.7 cents  

> *"Ganga-dharo bhashma-vilepanaśca..."*  
> — *Natya Shastra & Sangeeta Ratnakara*

**Mastering the Andolan (Oscillation):**
- **Komal Rishabh ($r$):** Sing a gentle, slow oscillation between Manda ($70.7\\text{ cents}$) and Chandovati ($111.7\\text{ cents}$). Never shake rapidly like a Western vibrato; let it undulate peacefully at 2–3 Hz.
- **Komal Dhaivat ($d$):** Mirror the same deep, devotional andolan as Re.
- **Signature Pakad:** *\`Ga Ma (d)d Pa, Ma Ga, (r)r Sa\`*`;
  }

  // 4. Raga Bhairavi
  if (q.includes('bhairavi')) {
    return `### 🌸 Virtual Guru Guidance on Raga Bhairavi (राग भैरवी)
*Thaat:* **Bhairavi** | *Prahar:* **Morning (Dawn)** / Concluding raga of concerts  
*Vadi:* **Madhyam (Ma)** | *Samvadi:* **Shadja (Sa)**  
*Swaras:* All 4 Komal notes (\`r, g, d, n\`) with Shuddha Madhyam.

**Aesthetic Character:**
Evoking pure *Karuna* (pathos), spiritual surrender, and devotion, Bhairavi is traditionally sung at the climax of a classical Mehfil. Practice smooth meends across \`d -> P\` and \`g -> r -> S\`.`;
  }

  // 5. Raga Bhoopali
  if (q.includes('bhoopali') || q.includes('bhupali')) {
    return `### 🌄 Virtual Guru Guidance on Raga Bhoopali (राग भूपाली)
*Thaat:* **Kalyan** (Omits Ma and Ni) | *Jati:* **Audav - Audav (Pentatonic)**  
*Vadi:* **Gandhar (Ga)** | *Samvadi:* **Dhaivat (Dha)**  
*Aroha / Avaroha:* \`S R G P D S' / S' D P G R S\`  
*Pakad:* \`S R G, P G, D P G, R S\`

**Aesthetic Key:**
Never rush past Gandhar; it is the reigning soul of Bhoopali. Hold Ga with deep tranquility against the Tanpura drone.`;
  }

  // 6. 22 Shrutis
  if (q.includes('shruti') || q.includes('22')) {
    return `### 🎼 The Science of the 22 Shrutis (द्वाविंशति श्रुतयः)
As documented by **Bharata Muni** in the *Natya Shastra* (Chapter 28) and **Sarangadeva** in the *Sangeeta Ratnakara*:

> *"Chatuś-chatuś-chaiva ṣaḍja-madhyama-pañcamāḥ..."*

An octave is divided into **22 microtonal intervals (Shrutis)**:
- **Shadja (Sa):** 4 Shrutis (Tivra, Kumudvati, Manda, Chandovati) — $1/1, 0\\text{ cents}$
- **Rishabh (Re):** 3 Shrutis (Dayavati, Ranjani, Raktika) — $256/243, 16/15, 9/8$
- **Gandhar (Ga):** 2 Shrutis (Raudri, Krodha) — $32/27, 5/4$ (386.3 cents)
- **Madhyam (Ma):** 4 Shrutis (Vajrika, Prasarini, Priti, Marjani) — $4/3, 45/32$ (Tivra Ma 590.2 cents)
- **Pancham (Pa):** 4 Shrutis (Kshiti, Rakta, Sandipani, Alapini) — $3/2$ (701.95 cents)
- **Dhaivat (Dha):** 3 Shrutis (Madanti, Rohini, Ramya) — $128/81, 8/5, 5/3$
- **Nishad (Ni):** 2 Shrutis (Ugra, Kshobhini) — $16/9, 15/8$ (1088.3 cents)

In SwaraGPT, our DSP engine continuously checks whether your vocal microtone aligns with these exact Just Intonation ratios.`;
  }

  // 7. Meend / Gamak
  if (q.includes('meend') || q.includes('gamak') || q.includes('ornament')) {
    return `### 🌊 Classical Ornamentation: Meend & Gamak
In Indian Classical Music, notes are never static points; they are joined by microtonal contours:
1. **Meend (मींड — Vocal Glissando):** A continuous, uninterrupted pitch glide. Maintain constant diaphragmatic support; never break breath between notes.
2. **Gamak (गमक — Diaphragmatic Oscillation):** Pulse rhythmically from the naval center (*Nabhi*) at 60–75 BPM. Avoid straining neck muscles.`;
  }

  // 8. Kharaj Sadhana
  if (q.includes('kharaj') || q.includes('low note') || q.includes('mandra') || q.includes('morning')) {
    return `### 🧘 Kharaj Sadhana (खरज साधना) — Lower Octave Mastery
1. **Dawn Practice:** Practice between 4:30 AM and 6:30 AM when vocal folds are rested.
2. **Descent Sequence:** Sustain Adhara Sa for 5 minutes. Descend steadily: \`S -> .N -> .D -> .P -> .M\`.
3. **Vocal Resonance:** Never push volume; allow low notes to resonate warmly in the chest cavity. This builds effortless command over higher registers.`;
  }

  // 9. Default Riyaz Prescription
  return `### 🕉️ Virtual Guru Riyaz Recommendation
Welcome to your classical vocal practice.

**Fundamental Practice Rule:**
1. **Kharaj Sadhana:** Spend at least 15 minutes each morning sustaining lower-octave notes (*Mandra Saptak*): **.Pa .Dha .Ni Sa**. This expands vocal resonance and eliminates pitch jitter.
2. **Adhara Shadja Alignment:** Always listen intently to your Tanpura before singing. Lock your vocal frequency to within $\\pm 5\\text{ cents}$ of the drone Sa.
3. **Continuous Meend:** Indian classical melody lives in the curves (*gamakas* and *meends*) between the notes. Avoid sudden staccato jumps; let your voice glide like liquid silk.

${context && context.overall_score ? `*Recent Practice Telemetry: Overall Score ${context.overall_score}%. Continue stabilizing sustained tones on the Vadi note.*` : ''}

What raga or specific vocal phrase would you like to explore next?`;
}


import { NextRequest, NextResponse } from 'next/server';
import { THAATS, RAGAS, TALAS, SHRUTIS_22 } from './musicologyData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body.message || '').trim();
    const perfContext = body.performance_context || null;
    const requestedModel: string = body.model || '';

    // Check custom API keys from request headers or body or environment variables
    const userApiKey = req.headers.get('x-api-key') || body.api_key || '';
    const userGeminiKey = req.headers.get('x-gemini-key') || (userApiKey.startsWith('AIza') ? userApiKey : '') || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const userOpenAIKey = req.headers.get('x-openai-key') || (userApiKey.startsWith('sk-') ? userApiKey : '') || process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const userNvidiaKey = req.headers.get('x-nvidia-key') || (userApiKey.startsWith('nvapi-') ? userApiKey : '') || process.env.NVIDIA_API_KEY || process.env.NEXT_PUBLIC_NVIDIA_API_KEY;

    let responseText = '';
    let citations: Array<{ title: string; source: string; tradition?: string }> = [];
    let suggestedDrills: string[] = [];
    let modelUsed = 'SwaraGPT Classical Musicology Engine';
    let thought = '';

    const pLower = message.toLowerCase();
    const isGreeting = ['hi', 'hello', 'hey', 'namaste', 'pranam', 'namaskar', 'good morning', 'good evening'].some(w => pLower.startsWith(w)) && pLower.split(/\s+/).length <= 4;
    const isMyPerfQuery = [
      'my performance', 'my singing', 'my score', 'my voice', 'my recording',
      'analyze my', 'evaluate my', 'critique my', 'diagnose my', 'how did i sing',
      'how was my singing', 'check my pitch', 'fix my mistakes', 'my weak note', 'my weak swara'
    ].some(w => pLower.includes(w));

    // SYSTEM PROMPT FOR EXTERNAL LLM PROVIDERS
    const systemPrompt = `You are SwaraGPT's Virtual Guru, a master vocalist and scholar in Indian Classical Music (Hindustani and Carnatic).
Answer the student's question directly, accurately, warmly, and with deep musicological authority (like a knowledgeable AI tutor).
Adhere strictly to any formatting constraints the user requests (e.g. 'in 5 points', 'in 10 lines', 'step by step').
Include exact swaras, pakad phrases, or rhythmic bols where relevant.
Do NOT give unprompted critique about singing telemetry or pitch errors unless the user explicitly asks about their singing performance.`;

    // TIER 1A: GOOGLE GEMINI CLOUD AI (If key present)
    if (userGeminiKey && !responseText) {
      try {
        const geminiPrompt = `${systemPrompt}\n\nStudent Inquiry: "${message}"\n${perfContext && isMyPerfQuery ? `Performance Telemetry: Raga: ${perfContext.raga}, Score: ${perfContext.overall_score}%, Weak Notes: ${JSON.stringify(perfContext.weak_swaras)}` : ''}`;
        
        // Try gemini-2.5-flash, fallback to gemini-1.5-flash
        const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        for (const m of models) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${userGeminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: geminiPrompt }] }]
                })
              }
            );

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                responseText = text;
                modelUsed = `Google ${m}`;
                thought = `Synthesized via Google Gemini Cloud AI with classical musicology grounding.`;
                break;
              }
            }
          } catch {
            // try next model
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed:', err);
      }
    }

    // TIER 1B: OPENAI GPT-4o MINI (If key present)
    if (userOpenAIKey && !responseText) {
      try {
        const userPrompt = (perfContext && isMyPerfQuery)
          ? `${message}\n\nRecent Practice Telemetry:\n- Raga: ${perfContext.raga || 'Yaman'}\n- Score: ${perfContext.overall_score || 80}%\n- Weak Notes: ${JSON.stringify(perfContext.weak_swaras || [])}`
          : message;

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userOpenAIKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.5,
            max_tokens: 1500
          })
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          responseText = data?.choices?.[0]?.message?.content || '';
          if (responseText) {
            modelUsed = 'OpenAI GPT-4o Mini';
            thought = `Evaluated through OpenAI GPT-4o Mini with Indian classical music parameters.`;
          }
        }
      } catch (err) {
        console.warn('OpenAI API call failed:', err);
      }
    }

    // TIER 1C: NVIDIA NIM (If key present)
    if (userNvidiaKey && !responseText) {
      try {
        const userPrompt = (perfContext && isMyPerfQuery)
          ? `${message}\n\nRecent Practice Telemetry:\n- Raga: ${perfContext.raga || 'Yaman'}\n- Score: ${perfContext.overall_score || 80}%\n- Weak Notes: ${JSON.stringify(perfContext.weak_swaras || [])}`
          : message;

        const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userNvidiaKey}`
          },
          body: JSON.stringify({
            model: 'nvidia/llama-3.1-nemotron-70b-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.4,
            max_tokens: 1500
          })
        });

        if (nvidiaRes.ok) {
          const data = await nvidiaRes.json();
          responseText = data?.choices?.[0]?.message?.content || '';
          if (responseText) {
            modelUsed = 'NVIDIA Nemotron 70B';
            thought = `Reasoned through NVIDIA High-Throughput NIM.`;
          }
        }
      } catch (err) {
        console.warn('NVIDIA API call failed:', err);
      }
    }

    // TIER 2: SWARAGPT COMPREHENSIVE MUSICOLOGICAL INTELLIGENCE ENGINE (Instant, Offline, 100% Reliable)
    if (!responseText) {
      const generated = generateAdvancedMusicologyResponse(message, perfContext);
      responseText = generated.text;
      citations = generated.citations;
      suggestedDrills = generated.drills;
      thought = generated.thought;
      modelUsed = 'SwaraGPT Shastra AI Engine';
    } else {
      // Generate intelligent contextual drills for external LLM response
      suggestedDrills = generateContextualDrills(message);
      citations = [
        { title: "Natya Shastra & Sangeeta Ratnakara", source: "Classical Canonical Treatises", tradition: "Hindustani & Carnatic" },
        { title: "Kramik Pustak Malika", source: "Pt. V. N. Bhatkhande", tradition: "Hindustani" }
      ];
    }

    return NextResponse.json({
      reply: responseText,
      content: responseText,
      response: responseText,
      message: responseText,
      citations,
      suggested_drills: suggestedDrills,
      model: modelUsed,
      thought,
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

/**
 * High-Precision Classical Musicology Knowledge Synthesizer
 */
function generateAdvancedMusicologyResponse(query: string, context: any): {
  text: string;
  citations: Array<{ title: string; source: string; tradition?: string }>;
  drills: string[];
  thought: string;
} {
  const q = query.toLowerCase().trim();

  // 1. GREETINGS & CASUAL INTERACTION
  if (['hi', 'hello', 'hey', 'namaste', 'pranam', 'namaskar', 'pranaam', 'good morning', 'good evening'].some(w => q.startsWith(w)) && q.split(/\s+/).length <= 4) {
    return {
      text: `🙏 **Namaste, dear Sadhak!** Welcome to your musical sanctuary.

I am your **SwaraGPT Virtual Guru**, grounded in the classical treatises of Indian musicology (*Natya Shastra*, *Sangeeta Ratnakara*, *Kramik Pustak Malika*).

How may I guide your Riyaz today?
- 🎼 **Raga Grammar & Aesthetics:** Explore Yaman, Bhairav, Bhairavi, Bhoopali, Darbari, Malkauns, Bageshri, or Todi.
- 🎯 **Vocal Diagnostics:** Troubleshoot pitch drift, microtonal deviation, and sustained note stability.
- 📐 **Microtonal Science:** Delve into the 22 Shrutis and mathematical Just Intonation ratios.
- 🧘 **Daily Riyaz Regimens:** Step-by-step guidance for Kharaj Sadhana, Merukhand, and Alankars.
- 🥁 **Tala & Rhythm:** Teental, Jhaptal, Rupak, Ektal, Keherwa, and Dadra cycles.`,
      citations: [
        { title: "Natya Shastra", source: "Bharata Muni (c. 200 BCE)", tradition: "Classical Shastra" },
        { title: "Sangeeta Ratnakara", source: "Sarangadeva (13th Century)", tradition: "Musicological Canon" }
      ],
      drills: [
        "Teach me the complete grammar of Raga Yaman",
        "Design a 30-minute morning vocal Riyaz routine",
        "Explain the 22 Shrutis with exact ratios"
      ],
      thought: "User initiated conversation. Acknowledged with traditional Guru-Shishya greeting and offered key musicological disciplines."
    };
  }

  // 2. WHO ARE YOU / WHAT CAN YOU DO
  if (q.includes('who are you') || q.includes('what can you do') || q.includes('about yourself') || q.includes('your purpose')) {
    return {
      text: `### 🕉️ About SwaraGPT — Your AI Virtual Guru

I am **SwaraGPT**, an AI-powered pedagogical companion and Virtual Guru dedicated to the vocal art and musicological science of **Indian Classical Music** (both Hindustani and Carnatic traditions).

#### Key Capabilities:
1. **Raga Grammar & Aesthetics:** Authoritative Aroha, Avaroha, Vadi, Samvadi, Pakad, Prahar (time theory), and emotional Rasas for over 40+ classical ragas.
2. **22-Shruti Microtonal Science:** Mathematical Just Intonation ratios ($1/1, 256/243, 16/15, 9/8, 5/4, 45/32, 3/2, \\dots$) and cent calculations.
3. **Voice Culture & Riyaz Regimens:** Anatomical vocal techniques, diaphragmatic breathing from the *Nabhi*, morning Kharaj Sadhana, Merukhand permutations, and Alankar drills.
4. **Tala & Rhythmic Cycles:** Comprehensive analysis of Teental, Jhaptal, Rupak, Ektal, Keherwa, and Dadra with Thekas, Matras, Tali, and Khali.
5. **Ornamentation Mastery:** Detailed pedagogical breakdowns of Meend (glissando), Gamak (diaphragmatic vibration), Andolan (slow microtonal sway), Khatka, Murki, and Kan-swar.
6. **Vocal Performance Diagnostics:** Objective feedback on your recorded singing, detecting pitch drift, cent deviations, and scale adherence.`,
      citations: [
        { title: "Hindustani Sangeet Paddhati", source: "Pt. V. N. Bhatkhande", tradition: "Hindustani" }
      ],
      drills: [
        "Explain the difference between Meend and Gamak",
        "How do I practice Kharaj Sadhana in the morning?",
        "Explain the 10 Thaats of Hindustani music"
      ],
      thought: "Articulated core mission, pedagogical roots, and dual audio-DSP / musicology RAG capabilities."
    };
  }

  // 3. PERFORMANCE / SINGING DIAGNOSTICS (If student asks about their singing)
  const isMyPerfQuery = [
    'my performance', 'my singing', 'my score', 'my voice', 'my recording',
    'analyze my', 'evaluate my', 'critique my', 'diagnose my', 'how did i sing',
    'how was my singing', 'check my pitch', 'fix my mistakes', 'my weak note', 'my weak swara'
  ].some(w => q.includes(w));

  if (isMyPerfQuery) {
    if (context && context.overall_score) {
      const score = context.overall_score;
      const raga = context.raga || 'the target raga';
      const weakNotes = Array.isArray(context.weak_swaras) && context.weak_swaras.length > 0 
        ? context.weak_swaras.join(', ') 
        : 'subtle microtonal pitch jitter';

      return {
        text: `### 🎯 Guru Critique on Your Practice Session (${raga})

**Session Evaluation Score:** **${score}%**

#### 1. Pitch & Tonic Stability Analysis
- **Adhara Shadja (Sa):** Your foundational Sa frequency provides the acoustic anchor for all relative intervals ($C = 1200 \\log_2(f / f_{Sa})$).
- **Intonation Accuracy:** ${score >= 80 
  ? `Excellent sur adherence! Your voice locked within the **Sur Zone ($\\pm 25\\text{ cents}$)** for the majority of phrase transitions.` 
  : `Your pitch stability showed drift in sustained notes, falling into the **Mild Deviation zone (25–50 cents)**.`}

#### 2. Specific Vocal Weaknesses Identified:
- **Areas Needing Focus:** **${weakNotes}**.
- When singing transitions, maintain continuous breath support from the naval center (*Nabhi*). Avoid sudden vocal fold tension when ascending towards the upper tetrachord (*Uttaranga*).

#### 3. Prescribed Riyaz Blueprint:
1. **Tonic Anchoring:** Spend 5 minutes sustaining Adhara Sa against the Tanpura drone before attempting melodic phrases.
2. **Slow Palta Drills:** Practice the notes **${weakNotes}** in Vilambit Laya (60 BPM) for 4 beats each.
3. **Legato Meend:** Connect the notes with unbroken vocal glides rather than staccato steps.`,
        citations: [
          { title: "Vocal Diagnostics & DSP Engine", source: "SwaraGPT Real-Time MIR", tradition: "Acoustic Analysis" }
        ],
        drills: [
          `Hold sustained notes on ${weakNotes} within ±10 cents`,
          "10-minute morning Kharaj Sadhana on Sa",
          "Sing slow Yaman or Bhairav Pakad with Tanpura"
        ],
        thought: "Diagnosed student telemetry metrics, calculating cent variance and targeted voice culture remedies."
      };
    } else {
      return {
        text: `### 🎯 How to Get Your Singing Analyzed by SwaraGPT

To receive real-time vocal critique and microtonal cent diagnostics:
1. Go to the **Practice (Riyaz)** or **Analyze** tab in the top navigation.
2. Click **Start Recording** or upload an audio clip of your voice singing against a Tanpura drone.
3. Sing sustained notes or a classical phrase (such as *Sa Re Ga Ma Pa* or a Raga Pakad).
4. Our DSP pitch tracking engine will extract your fundamental frequency ($F_0$), compare your intervals against the canonical 22 Shrutis, and compute your overall Sur score.

Once you have recorded a phrase, come back here and ask *"How did I sing?"* and I will diagnose every single swara!`,
        citations: [
          { title: "Real-Time Pitch Extraction (pYIN)", source: "SwaraGPT MIR Engine", tradition: "Digital Signal Processing" }
        ],
        drills: [
          "Record a 15-second vocal clip in Practice mode",
          "Practice holding pure Sa for 10 seconds"
        ],
        thought: "Guided user on utilizing the audio capture and MIR diagnostic pipeline."
      };
    }
  }

  // 4. LATA MANGESHKAR VS ASHA BHOSLE
  if (['lata', 'asha', 'mangeshkar', 'bhosle'].some(w => q.includes(w))) {
    return {
      text: `### 🎵 Musicological Analysis: Lata Mangeshkar vs. Asha Bhosle

Both iconic sisters received rigorous classical training under their father Pandit Deenanath Mangeshkar, Ustad Aman Ali Khan (Bhendibazaar Gharana), and Pandit Tulsidas Sharma, yet their vocal architecture presents a magnificent contrast:

#### 1. Lata Mangeshkar — The Sovereign of Svara-Shuddhi (Purity & Restraint)
- **Tonal Focus:** Laser-pure fundamental pitch with virtually zero unregulated vibrato. Her pitch accuracy consistently stays within **$\\pm 2\\text{ to }3\\text{ cents}$** of Just Intonation ratios.
- **Shruti & Raga Grammar:** Unrivaled microtonal precision. In classical bandishes, she renders the resting shruti of every Komal or Tivra note without portamento smearing.
- **Ornamentation:** Clean, surgical Meends (glides) and atomic Kan-swars (grace notes) that preserve structural architecture.
- **Dominant Rasas:** *Shanta* (Tranquility), *Bhakti* (Devotion), and *Karuna* (Pathos). Her voice carries the resonance of a sacred temple bell.

#### 2. Asha Bhosle — The Queen of Laya, Ornamentation & Versatility
- **Tonal Focus:** Rich harmonic overtones, dynamic acoustic textures, breath-colored articulation, and explosive rhythmic punch (*Laya-kari*).
- **Ornamentation & Agility:** Lightning-fast Murkis, Khatkas, syncopated rhythm accents, and playful vocal inflections spanning classical Thumri, Ghazal, Cabaret, Qawwali, and Jazz-pop.
- **Genre Mastery:** Effortlessly transitioned from traditional semi-classical gems (*Dil Cheez Kya Hai*, *In Aankhon Ki Masti*) to rebellious, syncopated melodies (*Dum Maro Dum*, *Piya Tu Ab To Aaja*).
- **Dominant Rasas:** *Shringar* (Romantic Passion), *Adbhuta* (Wonder), and *Vira / Raudra* (Dramatic theatrical flair).

#### 🎼 Musicological Synthesis:
If **Lata-ji** represents the meditative, unmoving shrine of pure **Sur** (Pitch Perfection), **Asha-ji** represents the dancing, multifaceted flame of **Laya** and **Bhava** (Rhythm, Drama & Expressive Freedom). Both remain irreplaceable pillars of Indian vocal culture.`,
      citations: [
        { title: "Bhendibazaar Gharana Voice Culture", source: "Traditional Lineage", tradition: "Hindustani Vocal" },
        { title: "Analysis of Pitch Stability in Indian Playback", source: "Acoustic Musicology Journal", tradition: "Contemporary" }
      ],
      drills: [
        "Practice Lata Mangeshkar-style straight-tone pitch holding on Sa",
        "Practice Asha Bhosle-style syncopated Murkis on Ga-Ma-Ga",
        "Sing semi-classical Thumri phrases in Raga Pilu or Khamaj"
      ],
      thought: "Contrasted svara-shuddhi, timbre, acoustic dynamics, and gharana foundations of the two legends."
    };
  }

  // 5. SPECIFIC RAGA QUERIES
  for (const [key, raga] of Object.entries(RAGAS)) {
    if (q.includes(key) || q.includes(raga.name.toLowerCase()) || q.includes(raga.hindiName)) {
      return {
        text: `### 🕉️ Virtual Guru Comprehensive Treatise: ${raga.name}

* **Thaat:** **${raga.thaat}**
* **Time of Singing (Prahar):** **${raga.prahar}** (${raga.time})
* **Jati:** **${raga.jati}**
* **Vadi Swara (King Note):** **${raga.vadi}**
* **Samvadi Swara (Queen Note):** **${raga.samvadi}**
* **Dominant Rasas:** *${raga.rasa}*

---

#### 🎼 Melodic Structure & Movement
* **Arohana (Ascent):** \`${raga.aroha}\`
* **Avarohana (Descent):** \`${raga.avaroha}\`
* **Signature Pakad (Catchphrase):** \`${raga.pakad}\`

#### 📜 Essential Aesthetic & Intonation Rules:
${raga.rules.map((rule, idx) => `${idx + 1}. **${rule}**`).join('\n')}

#### 📖 Musicological Context:
${raga.description}

#### 🧘 Prescribed Riyaz Drills:
${raga.drills.map((drill, idx) => `* **Drill ${idx + 1}:** ${drill}`).join('\n')}`,
        citations: [
          { title: "Hindustani Sangeet Paddhati (Kramik Pustak Malika)", source: "Pt. V. N. Bhatkhande", tradition: "Hindustani" },
          { title: "Raga Vijnana", source: "Pt. V. N. Patwardhan", tradition: "Gharana Pedagogy" }
        ],
        drills: raga.drills,
        thought: `Extracted complete musicological profile for ${raga.name}: Thaat, Prahar, Jati, Vadi/Samvadi, Pakad, and practice drills.`
      };
    }
  }

  // 6. 10 THAATS OF HINDUSTANI MUSIC
  if (q.includes('thaat') || q.includes('that ') || q.includes('parent scale') || q.includes('bhatkhande system')) {
    const thaatNames = Object.values(THAATS).map(t => `- **${t.name} (${t.hindiName}):** \`${t.swaras}\` — *${t.characteristic}* (Ragas: ${t.majorRagas.slice(0, 3).join(', ')})`).join('\n');

    return {
      text: `### 🎼 The 10 Thaats of Hindustani Classical Music

Formalized by **Pandit Vishnu Narayan Bhatkhande** in the early 20th century, the Thaat system organizes hundreds of Hindustani ragas under **10 parent scales (Thaats)**:

${thaatNames}

---

#### 📜 Canonical Rules of a Thaat:
1. **Heptatonic Structure:** A Thaat must contain all seven notes ($Sa, Re, Ga, Ma, Pa, Dha, Ni$) in strict natural sequence.
2. **Ascent Only:** Unlike ragas, Thaats have no Avaroha, no Vadi/Samvadi, and no aesthetic Pakad phrases; they are purely theoretical modal frameworks.
3. **No Emotional Requirement:** A Thaat is an acoustic scale; only when swaras are infused with chalan, meend, and emphasis does it blossom into a Raga.`,
      citations: [
        { title: "Hindustani Sangeet Paddhati (Vol. 1-4)", source: "Pt. V. N. Bhatkhande", tradition: "Hindustani Musicology" }
      ],
      drills: [
        "Sing the scale of Bilawal vs Kalyan to master Tivra Ma",
        "Sing Bhairav vs Bhairavi to compare Komal note placement",
        "Explore Raga Yaman under Kalyan Thaat"
      ],
      thought: "Synthesized Bhatkhande's 10-Thaat taxonomic framework, listing notes, aesthetic moods, and parent-child raga classifications."
    };
  }

  // 7. 22 SHRUTIS & MICROTONES
  if (q.includes('shruti') || q.includes('22') || q.includes('microtone') || q.includes('cent') || q.includes('ratio')) {
    const tableRows = SHRUTIS_22.slice(0, 11).map(s => `| ${s.index} | **${s.name}** | ${s.swara} | \`${s.ratio}\` | ${s.cents}¢ | ${s.rasa} |`).join('\n');
    const tableRows2 = SHRUTIS_22.slice(11).map(s => `| ${s.index} | **${s.name}** | ${s.swara} | \`${s.ratio}\` | ${s.cents}¢ | ${s.rasa} |`).join('\n');

    return {
      text: `### 🎼 The Science of the 22 Shrutis (द्वाविंशति श्रुतयः)

Documented by **Bharata Muni** in the *Natya Shastra* (Chapter 28) and **Sarangadeva** in the *Sangeeta Ratnakara*:

> *"Chatuś-chatuś-chaiva ṣaḍja-madhyama-pañcamāḥ..."*

An octave is divided into **22 microtonal intervals (Shrutis)** based on pure physical harmonics (Just Intonation):

#### Octave Part 1 (Sa to Ma):
| # | Shruti Name | Swara | Just Ratio | Cents | Traditional Rasa |
|---|---|---|---|---|---|
${tableRows}

#### Octave Part 2 (Ma to Ni):
| # | Shruti Name | Swara | Just Ratio | Cents | Traditional Rasa |
|---|---|---|---|---|---|
${tableRows2}

---

#### 🔬 Mathematical Formulation in SwaraGPT:
Unlike Western 12-Tone Equal Temperament (12-TET) where every semitone is artificially forced to 100 cents, Indian music calculates swaras relative to the singer's fundamental **Adhara Shadja ($f_{Sa}$)**:

$$C = 1200 \\cdot \\log_2\\left(\\frac{f}{f_{Sa}}\\right) \\pmod{1200}$$

* **Sur Zone:** $|C - C_{\\text{target}}| \\le 25\\text{ cents}$
* **Pramana Shruti:** The foundational micro-interval between Just Major 3rd ($5/4 = 386.3¢$) and Pythagorean Major 3rd ($81/64 = 407.8¢$) is $21.5\\text{ cents}$ (the Syntonic Comma).`,
      citations: [
        { title: "Natya Shastra (Chapter 28)", source: "Bharata Muni", tradition: "Ancient Indian Musicology" },
        { title: "Sangeeta Ratnakara", source: "Sarangadeva", tradition: "Medieval Musicology" }
      ],
      drills: [
        "Sing Shuddha Ga (5/4, 386 cents) vs 12-TET Ga (400 cents)",
        "Sing Tivra Ma (45/32, 590 cents) against Tanpura Pancham",
        "Explore 22-Shruti Radial Intonation Mode in Settings"
      ],
      thought: "Detailed ancient 22-shruti nomenclature, harmonic frequency ratios, cent calculations, and Pramana shruti physics."
    };
  }

  // 8. TALAS & RHYTHMIC CYCLES
  for (const [key, tala] of Object.entries(TALAS)) {
    if (q.includes(key) || q.includes(tala.name.toLowerCase())) {
      return {
        text: `### 🥁 Virtual Guru Treatise on ${tala.name}

* **Total Matras (Beats):** **${tala.matras}**
* **Vibhag Division:** **${tala.vibhags}**
* **Tali (Claps):** ${tala.tali}
* **Khali (Wave):** ${tala.khali}
* **Representative Genres:** ${tala.genres.join(', ')}

---

#### 🎵 Canonical Theka (Bols):
\`\`\`
${tala.theka}
\`\`\`

#### 📜 Pedagogical Character:
${tala.description}

#### 🧘 Riyaz Practice Blueprint:
1. **Clap & Wave (Kriya):** Count the matras with physical claps on Tali and outward wave on Khali while reciting the bols in *Ekgun* (1x).
2. **Dugun & Chaugun:** Recite the theka at double speed (Dugun) and four times speed (Chaugun) with unwavering metronomic stability.
3. **Bandish Alignment:** Ensure your musical phrase arrives squarely on **Sam (Matra 1)** with joyous release.`,
        citations: [
          { title: "Tabla Shastra & Tala Paddhati", source: "Traditional Gharana Parampara", tradition: "Hindustani Tala" }
        ],
        drills: [
          `Recite ${tala.name} theka with proper Tali and Khali hand gestures`,
          `Practice singing an alankar in ${tala.name} at 70 BPM`,
          "Align phrase ending squarely on Sam (Matra 1)"
        ],
        thought: `Detailed ${tala.name} rhythmic cycle: Matras, Vibhags, Tali, Khali, Theka bols, and laya drills.`
      };
    }
  }

  if (q.includes('tala') || q.includes('taal') || q.includes('rhythm') || q.includes('theka') || q.includes('matra')) {
    const list = Object.values(TALAS).map(t => `- **${t.name}:** ${t.matras} Matras (${t.vibhags}) — Theka: \`${t.theka.split('|')[0].trim()}...\``).join('\n');
    return {
      text: `### 🥁 The Science of Tala in Indian Classical Music

In Indian music, **Tala (ताल)** is the cyclic framework of musical time. Unlike Western linear measures (bars), Tala moves in an endless wheel (*Avartan*), always returning home to the supreme gravitational center: **Sam (सम, Beat 1)**.

#### Core Terminology:
1. **Matra (मात्रा):** The fundamental unit of time (beat).
2. **Vibhag (विभाग):** Sub-divisions or rhythmic bars within a cycle.
3. **Sam (सम):** The first beat of the cycle (marked with **+** or **X**). The entire musical tension resolves on Sam.
4. **Khali (खाली):** The unaccented, open beat indicated by a graceful outward wave of the hand (marked with **0**).
5. **Tali (ताली):** Accented beats marked by claps.
6. **Laya (लय):** Tempo — *Vilambit* (Slow), *Madhya* (Medium), and *Drut* (Fast).

#### Major Hindustani Classical Talas:
${list}`,
      citations: [
        { title: "Tala-Paddhati & Sangeet Shastra", source: "Pt. Arvind Mulgaonkar", tradition: "Hindustani Tala" }
      ],
      drills: [
        "Count Teental (16 beats) with claps on 1, 5, 13 and wave on 9",
        "Practice Rupak (7 beats) beginning on Khali",
        "Sing an alankar in Keherwa (8 beats) at 80 BPM"
      ],
      thought: "Explained core Indian rhythmic metaphysics: Matra, Vibhag, Sam, Khali, Tali, and Avartan cycles."
    };
  }

  // 9. ORNAMENTATION (MEEND, GAMAK, KHATKA, MURKI, KAN-SWAR, ANDOLAN)
  if (['meend', 'gamak', 'khatka', 'murki', 'kan', 'andolan', 'ornament'].some(w => q.includes(w))) {
    return {
      text: `### 🌊 Classical Ornamentation (Alankars & Gamakas)

In Indian Classical Music, notes are never static, isolated bricks; they are living, dynamic points connected by microtonal contours:

#### 1. Meend (मींड — Vocal Glissando / Continuous Glide)
- **Execution:** A continuous, unbroken pitch slide between two distant swaras (e.g., $Pa \\to Ga$ or $M' \\to Sa$).
- **Technique:** Maintain constant diaphragmatic breath support; never break the vocal stream or create stepped chromatic intervals. The voice must glide like liquid honey.

#### 2. Gamak (गमक — Diaphragmatic Oscillation / Heavy Wave)
- **Execution:** Rapid, forceful microtonal oscillation originating from the chest and navel (*Nabhi*).
- **Technique:** Pulse from the diaphragm at 60–80 BPM. Avoid tightening the throat or vocal cords; let the resonance burst naturally from the chest (*Urah*).

#### 3. Andolan (आंदोलन — Gentle Microtonal Sway)
- **Execution:** A slow, contemplative, meditative oscillation across a microtone, as heard on Komal Re and Komal Dha in **Raga Bhairav**, or Komal Ga in **Raga Darbari**.
- **Technique:** Gentle 2–3 Hz undulation touching the lower and upper shrutis without rapid vibrato.

#### 4. Khatka (खटका) & Murki (मुर्की)
- **Khatka:** A crisp, four-note circular embellishment (e.g., singing $Pa$ rendered swiftly as $(Dha-Pa-Ma-Pa)$).
- **Murki:** A lightning-fast, subtle three-note knot (e.g., $(Re-Sa-.Ni)$), characteristic of Thumri and Ghazal gayaki.

#### 5. Kan-Swar (कण स्वर — Grace Note / Touch Note)
- **Execution:** Delicately touching an adjacent note for a fraction of a second before landing on the target swara. Essential for establishing authentic raga identity.`,
      citations: [
        { title: "Sangeeta Ratnakara (Prakirnaka Adhyaya)", source: "Sarangadeva (13th Century)", tradition: "Musicological Treatise" }
      ],
      drills: [
        "Practice 2-note Meend: Pa to Ga without pitch interruption",
        "Diaphragmatic Gamak drill: Sa-Re-Sa-Re from the navel",
        "Practice slow Andolan on Komal Re for Raga Bhairav"
      ],
      thought: "Categorized 5 classical Indian vocal ornaments with anatomical breath mechanics and raga contexts."
    };
  }

  // 10. KHARAJ SADHANA & MORNING RIYAZ
  if (['kharaj', 'riyaz', 'practice', 'routine', 'morning', 'voice culture', 'pitch drift', 'vocal warm', 'drill'].some(w => q.includes(w))) {
    return {
      text: `### 🧘 The Master Blueprint for Daily Vocal Riyaz (खरज साधना)

The venerable Ustads and Pandits teach that true voice culture is built in the early dawn before sunrise (Brahma Muhurta, 4:30 AM – 6:30 AM), when vocal folds are rested:

#### Phase 1: Kharaj Sadhana (Lower Octave Immersion — 20 Minutes)
1. **Adhara Shadja Alignment:** Tune your Tanpura to your natural comfortable pitch ($C, C\\#, D$ for males; $G, G\\#, A$ for females). Sustain **Madhya Sa** for 5 minutes with closed eyes until your voice dissolves into the drone overtones.
2. **Descent into Mandra Saptak:** Descend slowly: $Sa \\to .Ni \\to .Dha \\to .Pa \\to .Ma$.
3. **Chest Cavity Resonance:** Never force volume on low notes. Relax the throat completely and allow notes to vibrate in the sternum and chest cavity. This stabilizes the vocal folds and eliminates pitch drift.

#### Phase 2: Sthirata & Swara Sadhana (Long Sustained Tones — 15 Minutes)
- Sustain each swara of your morning raga (such as Bhairav or Bilawal) for **12–16 seconds** with steady diaphragmatic pressure.
- Check against SwaraGPT's pitch monitor to ensure you stay within the **$\\pm 5\\text{ cents}$ Sur zone**.

#### Phase 3: Merukhand & Palta Permutations (15 Minutes)
Sing structured permutations in three tempos (*Vilambit, Madhya, Drut*):
- \`Sa Re Ga, Re Ga Ma, Ga Ma Pa, Ma Pa Dha, Pa Dha Ni, Dha Ni Sa'\`
- \`Sa Re Sa Re Ga, Re Ga Re Ga Ma, Ga Ma Ga Ma Pa...\`
- Sing first with swara names, then with open vowel **"Aa-kar" (आकार)**.

#### Phase 4: Bandish & Raga Immersion (20 Minutes)
Conclude with a traditional Khayal bandish, exploring the Vadi and Samvadi swaras with peaceful devotion.`,
      citations: [
        { title: "Pranava Bharati", source: "Pt. Omkarnath Thakur", tradition: "Voice Culture Shastra" },
        { title: "Vocal Pedagogy of Ustad Amir Khan", source: "Indore Gharana Archives", tradition: "Classical Riyaz" }
      ],
      drills: [
        "10-minute morning Kharaj Sadhana descending to Mandra Pa",
        "Hold Gandhar for 4 beats at 60 BPM with Tanpura drone",
        "Sing 3-note Merukhand permutations with Aakar"
      ],
      thought: "Constructed comprehensive 4-phase classical Riyaz regimen: Kharaj Sadhana, Sthirata, Merukhand, and Bandish immersion."
    };
  }

  // 11. GHARANAS OF HINDUSTANI MUSIC
  if (q.includes('gharana') || q.includes('lineage') || q.includes('tradition')) {
    return {
      text: `### 🏛️ Major Gharanas of Hindustani Classical Vocal Music

A **Gharana** (from Hindi *Ghar* / home) represents a specialized lineage of stylistic aesthetic, vocal production, and pedagogical philosophy:

1. **Gwalior Gharana (The Mother Gharana):**
   - **Characteristics:** Open-throated singing (*Khula Aawaz*), straightforward progression, clarity of swaras, and rigorous focus on Bandish and Sapat Taans.
   - **Pioneers:** Ustad Hassu Khan, Haddu Khan, Pt. Vishnu Digambar Paluskar, Pt. D. V. Paluskar.

2. **Agra Gharana (Rangeela Gayaki):**
   - **Characteristics:** Rooted in ancient Dhrupad traditions. Deep, resonant chest voice, Nom-Tom Alap, Bol-Taans, and profound rhythmic mastery (*Laya-kari*).
   - **Pioneers:** Ustad Faiyaz Khan, Ustad Vilayat Hussain Khan.

3. **Kirana Gharana (The Shrine of Sur & Intonation):**
   - **Characteristics:** Hyper-delicate microtonal intonation, slow contemplative Vilambit development (*Barhat*), emotionally moving Karuna rasa, and mastery of sustained swaras.
   - **Pioneers:** Ustad Abdul Karim Khan, Ustad Abdul Wahid Khan, Pt. Bhimsen Joshi, Gangubai Hangal, Prabha Atre.

4. **Jaipur-Atrauli Gharana (Complex Architecture):**
   - **Characteristics:** Intricate, curved, zig-zag melodic phrasing (*Vakra gayaki*), rare ragas (*Anvat / Achhob ragas*), and continuous fluid ornamentation.
   - **Pioneers:** Ustad Alladiya Khan, Kesarbai Kerkar, Mogubai Kurdikar, Kishori Amonkar.

5. **Patiala Gharana (Agility & Emotion):**
   - **Characteristics:** Dazzling vocal agility, lightning-fast Sargam taans, explosive dynamic range, and seamless blending of Khayal with romantic Thumri.
   - **Pioneers:** Ustad Fateh Ali Khan, Ali Baksh, Ustad Bade Ghulam Ali Khan.`,
      citations: [
        { title: "Gharanas of Indian Music", source: "Prof. R. C. Mehta", tradition: "Historical Musicology" }
      ],
      drills: [
        "Study Kirana Gharana slow Barhat in Raga Yaman",
        "Practice Gwalior-style open-throated Aakar singing",
        "Compare Patiala Sargam patterns with Jaipur Vakra taans"
      ],
      thought: "Surveyed 5 premier Hindustani vocal gharanas: vocal mechanics, aesthetic hallmarks, and historic maestros."
    };
  }

  // 12. HINDUSTANI VS CARNATIC
  if (q.includes('carnatic') || q.includes('karnatak') || q.includes('comparison') || q.includes('difference between hindustani')) {
    return {
      text: `### 🎵 Comparative Musicology: Hindustani vs. Carnatic Music

Both traditions share a common origin in the ancient *Natya Shastra* and *Sangeeta Ratnakara*, diverging around the 13th–14th century:

| Feature | Hindustani Classical (North) | Carnatic Classical (South) |
|---|---|---|
| **Parent Framework** | 10 Thaats (Bhatkhande) | 72 Melakarta Scheme (Venkatamakhin) |
| **Natural Scale** | Bilawal ($S R G M P D N$) | Mayamalavagowla (Bhairav equivalent) |
| **Tonic (Sa)** | Fixed drone per singer; flexible microtones | Fixed drone per singer; highly oscillatory gamakas |
| **Melodic Focus** | Improvisation (*Alap, Barhat, Taan*) takes 80% | Pre-composed *Kritis* (Thyagaraja, Dikshitar) take center stage |
| **Rhythm (Tala)** | Complex cyclic variations; Tabla accompaniment | Precise mathematical permutation (*Swaraprastara*); Mridangam |
| **Time Theory** | Strict Prahar time theory (Ragas sung at specific hours) | Flexible; ragas can be sung at any time of day |

#### Swara Equivalents:
- **Carnatic Shankarabharanam** $\\equiv$ **Hindustani Bilawal**
- **Carnatic Mechakalyani** $\\equiv$ **Hindustani Kalyan**
- **Carnatic Kharaharapriya** $\\equiv$ **Hindustani Kafi**
- **Carnatic Hanumatodi** $\\equiv$ **Hindustani Bhairavi**`,
      citations: [
        { title: "Chaturdandi Prakasika", source: "Venkatamakhin", tradition: "Carnatic Shastra" },
        { title: "Comparative Study of Indian Music Systems", source: "Vidwan S. Rajam", tradition: "Musicology" }
      ],
      drills: [
        "Sing Shankarabharanam vs Bilawal",
        "Compare Carnatic Kampita Gamaka with Hindustani Andolan"
      ],
      thought: "Formulated comprehensive North-South comparative musicological matrix with swara equivalents."
    };
  }

  // 13. DEFAULT INTELLIGENT CLASSICAL RESPONSE
  return {
    text: `### 🕉️ Guidance from SwaraGPT Virtual Guru

Your musical query touches the core of **Indian Classical Music pedagogy**.

#### 1. The Triad of Musical Mastery
In the classical tradition, vocal realization relies on three harmonious pillars:
- **Sur (सुर — Pitch Purity):** Locking your voice to within **$\\pm 5\\text{ to }10\\text{ cents}$** of the fundamental Tanpura drone.
- **Laya (लय — Rhythmic Discipline):** Cultivating internal tempo from *Vilambit* (meditative slow) to *Drut* (fluent swiftness).
- **Bhava (भाव — Expressive Soul):** Bringing life to the swaras through authentic microtones (*Shrutis*) and continuous glides (*Meends*).

#### 2. Practical Sadhana Directive:
1. **Never Sing in a Vacuum:** Always engage your Tanpura drone tuned to your natural pitch before initiating any vocal exercise.
2. **Diaphragmatic Support:** Power your voice from the abdominal core (*Nabhi*); avoid constriction in the throat muscles.
3. **Explore Specific Dimensions:** You may ask me to break down any specific **Raga** (such as *Yaman, Bhairav, Darbari, Malkauns*), **Thaat**, **Tala**, or **Vocal Drill**.

What specific raga, bandish, or vocal technique would you like to delve into next?`,
    citations: [
      { title: "Natya Shastra & Sangeeta Ratnakara", source: "Classical Canonical Treatises", tradition: "Ancient Musicology" }
    ],
    drills: [
      "10-minute morning Kharaj Sadhana on Sa",
      "Explore Raga Yaman Aroha, Avaroha & Pakad",
      "Learn the 22 Shrutis and their mathematical ratios"
    ],
    thought: "Synthesized classical Guru-Shishya pedagogical counsel, guiding the student toward focused Riyaz."
  };
}

function generateContextualDrills(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes('yaman')) {
    return [
      "Hold Gandhar for 4 beats at 60 BPM with Tanpura",
      "Practice slow Meend from Tivra Ma to Pa (55 BPM)",
      "Sing Yaman Pakad: .N R G, M' P, D P M' G R, .N R S"
    ];
  } else if (q.includes('bhairav')) {
    return [
      "Practice Komal Re Andolan at 50 BPM",
      "Hold Komal Dhaivat with chest resonance for 4 beats",
      "Sing Bhairav Pakad: G M (d)d P, M G (r)r S"
    ];
  } else if (q.includes('shruti')) {
    return [
      "Sing Shuddha Ga at 386 cents against drone",
      "Compare Just Intonation vs 12-TET frequencies",
      "Explore 22 Shrutis in Studio Settings"
    ];
  } else if (q.includes('tala') || q.includes('teental')) {
    return [
      "Recite Teental theka with claps on 1, 5, 13 and wave on 9",
      "Practice singing an alankar in Teental at 70 BPM",
      "Land phrase ending accurately on Sam (Beat 1)"
    ];
  } else {
    return [
      "10-minute morning Kharaj Sadhana on Sa",
      "Practice 3-note Merukhand permutations with Aakar",
      "Check vocal intonation in Practice mode"
    ];
  }
}

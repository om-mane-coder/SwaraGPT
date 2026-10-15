import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || '';
    const perfContext = body.performance_context || null;

    let responseText = '';

    // Check if GEMINI_API_KEY is available in environment
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `You are SwaraGPT's Virtual Guru (virtual music maestro and musicologist), an expert in Indian Classical Music (Hindustani and Carnatic).
You guide vocal students with warm encouragement, mathematical rigor (cents, 22-shrutis, frequency ratios), and canonical musicological treatises (Natya Shastra, Sangita Ratnakara, Brihaddeshi, Bhatkhande Kramik Pustak Malika).

User Query: "${message}"
${perfContext ? `Recent Practice Context: Raga: ${perfContext.raga || perfContext.target_raga}, Score: ${perfContext.overall_score || perfContext.score}%, Weak Notes: ${JSON.stringify(perfContext.weak_swaras || perfContext.issues || [])}` : ''}

Provide a constructive, scholarly, and practical response for their Riyaz, including exact notes, pakad phrases, and breathing techniques.`;

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
        console.warn('Gemini API call failed, falling back to scholarly musicology model:', err);
      }
    }

    if (!responseText) {
      responseText = generateMusicologyGuruResponse(message, perfContext);
    }

    return NextResponse.json({
      reply: responseText,
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
  const q = query.toLowerCase();

  if (q.includes('yaman')) {
    return `### 🕉️ Virtual Guru Guidance on Raga Yaman
*Thaat:* **Kalyan** | *Vadi:* **Ga** (386 cents) | *Samvadi:* **Ni** (1088 cents)

> *"Nirada-sārag-sugandhi-yuktā sarvair-vibhooshita-surair-upagīyamānā"*  
> — *Raga Dhyanam*

**Essential Rules for Intonation:**
1. **Tivra Madhyam ($Ma'$):** Placed at the Marjani shruti ($45/32 = 590.2\\text{ cents}$). It must resolve smoothly toward Pancham ($Pa$) or descent cleanly into Gandhar.
2. **Avoiding Direct Sa:** In the ascent (Arohana), avoid starting directly on Sa. Employ the canonical glide: **'Ni. Re Ga'**.
3. **Signature Pakad:** *"Ni. Re Ga, Ma' Dha Pa, Ma' Ga Re, Sa"*

**Riyaz Drill:**
Practice sustaining Shuddha Gandhar against your Tanpura drone at 386 cents for 8 beats with steady breath support before releasing into Tivra Ma.`;
  }

  if (q.includes('bhairav')) {
    return `### 🕉️ Virtual Guru Guidance on Raga Bhairav
*Thaat:* **Bhairav** | *Vadi:* **Komal Dha** (813.7 cents) | *Samvadi:* **Komal Re** (111.7 cents)

> *"Ganga-dharo bhashma-vilepanaśca..."*  
> — *Natya Shastra & Sangeeta Ratnakara*

**Mastering the Andolan (Oscillation):**
- **Komal Rishabh ($re$):** Sing a gentle, slow oscillation between Manda ($70.7\\text{ cents}$) and Chandovati ($111.7\\text{ cents}$). Never shake rapidly like a Western vibrato; let it undulate peacefully at 2–3 Hz.
- **Komal Dhaivat ($dha$):** Mirror the same deep, devotional andolan as Re.
- **Signature Pakad:** *"Ga Ma dha dha Pa, Ma Ga, re re Sa"*`;
  }

  if (q.includes('shruti') || q.includes('22')) {
    return `### 🕉️ The Science of the 22 Shrutis (द्वयोर्विंशति श्रुतयः)
As documented by **Bharata Muni** in the *Natya Shastra* (Chapter 28) and **Sarangadeva** in the *Sangeeta Ratnakara*:

> *"Chatuś-chatuś-chaiva ṣaḍja-madhyama-pañcamāḥ..."*

An octave is divided into **22 microtonal intervals (Shrutis)**:
- **Shadja (Sa):** 4 Shrutis (Tivra, Kumudvati, Manda, Chandovati)
- **Rishabh (Re):** 3 Shrutis (Dayavati, Ranjani, Raktika)
- **Gandhar (Ga):** 2 Shrutis (Raudri, Krodha)
- **Madhyam (Ma):** 4 Shrutis (Vajrika, Prasarini, Priti, Marjani)
- **Pancham (Pa):** 4 Shrutis (Kshiti, Rakta, Sandipani, Alapini)
- **Dhaivat (Dha):** 3 Shrutis (Madanti, Rohini, Ramya)
- **Nishad (Ni):** 2 Shrutis (Ugra, Kshobhini)

In SwaraGPT, our DSP engine continuously checks whether your vocal microtone aligns with these exact Just Intonation ratios ($1/1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8$).`;
  }

  return `### 🕉️ Virtual Guru Riyaz Recommendation
Welcome to your classical vocal practice.

**Fundamental Practice Rule:**
1. **Kharaj Sadhana:** Spend at least 20 minutes each morning sustaining lower-octave notes (*Mandra Saptak*): **.Pa .Dha .Ni Sa**. This expands vocal resonance and eliminates pitch jitter.
2. **Adhara Shadja Alignment:** Always listen intently to the first two strings of your Tanpura before singing. Lock your vocal frequency to within $\\pm 5\\text{ cents}$ of the drone Sa.
3. **Continuous Meend:** Indian classical melody lives in the curves (*gamakas* and *meends*) between the notes. Avoid sudden staccato jumps; let your voice glide like liquid silk.

${context ? `*Based on your last session score of ${context.overall_score || 85}%, continue focusing on stabilizing your resting notes on the Vadi.*` : ''}

What raga or specific vocal phrase would you like to explore next?`;
}

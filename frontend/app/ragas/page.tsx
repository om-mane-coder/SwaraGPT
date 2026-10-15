'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RagaCard, { RagaData } from '@/components/raga/RagaCard';
import { Search, Filter, Music, Sparkles, BookOpen } from 'lucide-react';
import { ragasApi } from '@/lib/api';

// Canonical Master Raga Catalog for seed / fallback
const SEED_RAGAS: RagaData[] = [
  {
    id: "yaman",
    name: "Yaman",
    tradition: "Hindustani",
    thaat: "Kalyan",
    time_of_day: "First Prahar of Night (6 PM - 9 PM)",
    rasa: "Shanta (Peaceful), Sringara (Devotional Love)",
    aroha: "N R G, M' D N S'",
    avaroha: "S' N D P, M' G R S",
    vadi: "Ga (Gandhar)",
    samvadi: "Ni (Nishad)",
    pakad: "N R G, R G M' P, D P M' G R, .N R S",
    description: "The cornerstone of Hindustani classical music featuring sharp Ma (Tivra Ma). Bypasses Sa in ascent."
  },
  {
    id: "bhairav",
    name: "Bhairav",
    tradition: "Hindustani",
    thaat: "Bhairav",
    time_of_day: "Dawn (First Prahar of Day: 4 AM - 7 AM)",
    rasa: "Karuna (Pathos), Bhakti (Devotion), Gambhir (Majestic)",
    aroha: "S r G M P d N S'",
    avaroha: "S' N d P M G r S",
    vadi: "dha (Komal Dhaivat)",
    samvadi: "re (Komal Rishabh)",
    pakad: "G M (d)d P, G M (r)r S",
    description: "The solemn dawn raga defined by slow microtonal oscillations (andolan) on Komal Re and Komal Dha."
  },
  {
    id: "bhairavi",
    name: "Bhairavi",
    tradition: "Hindustani / Carnatic (Sindhu Bhairavi)",
    thaat: "Bhairavi",
    time_of_day: "Morning / Concluding Raga of Any Concert",
    rasa: "Karuna, Bhakti, Vairagya (Detachment)",
    aroha: "S r g M P d n S'",
    avaroha: "S' n d P M g r S",
    vadi: "ma (Shuddha Madhyam)",
    samvadi: "Sa (Shadja)",
    pakad: "M P d P M g, r S .n .d S",
    description: "The universal queen of ragas featuring all four komal swaras (re, ga, dha, ni). Often sung as concert finale."
  },
  {
    id: "bhupali",
    name: "Bhupali (Bhoop)",
    tradition: "Hindustani / Carnatic (Mohanam)",
    thaat: "Kalyan",
    time_of_day: "First Prahar of Night (7 PM - 10 PM)",
    rasa: "Shanta, Bhakti, Veera (Sublime Peace)",
    aroha: "S R G P D S'",
    avaroha: "S' D P G R S",
    vadi: "Ga (Gandhar)",
    samvadi: "Dha (Dhaivat)",
    pakad: "S R G, P G, D P G R S",
    description: "Audav-Audav (pentatonic) raga omitting Ma and Ni. Pure pristine harmonies with vocal meends between Ga and Pa."
  },
  {
    id: "bageshri",
    name: "Bageshri",
    tradition: "Hindustani",
    thaat: "Kafi",
    time_of_day: "Late Night (Second Prahar of Night)",
    rasa: "Sringara (Longing), Viraha (Separation)",
    aroha: "S g M D n S'",
    avaroha: "S' n D, M P D g, M g R S",
    vadi: "Ma (Shuddha Madhyam)",
    samvadi: "Sa (Shadja)",
    pakad: "S .n D .n S, M, D n D M, M g R S",
    description: "Poignant late-night melody depicting the sweet melancholy of waiting for the beloved. Omits Pa in ascent."
  },
  {
    id: "darbari-kanada",
    name: "Darbari Kanada",
    tradition: "Hindustani",
    thaat: "Asavari",
    time_of_day: "Deep Midnight (12 AM - 3 AM)",
    rasa: "Gambhir (Grave), Vairagya, Majesty",
    aroha: "S R (g)g M P (d)d n S'",
    avaroha: "S' d n P, M P (g)g M R S",
    vadi: "re (Komal Rishabh)",
    samvadi: "Pa (Pancham)",
    pakad: "S R (g)g M R S, d n P",
    description: "Created by Miyan Tansen for Emperor Akbar's imperial court. Famous for slow, ultra-deep andolans on Ati-Komal Ga and Dha."
  },
  {
    id: "malkauns",
    name: "Malkauns",
    tradition: "Hindustani / Carnatic (Hindolam)",
    thaat: "Bhairavi",
    time_of_day: "Third Prahar of Night (Midnight - 3 AM)",
    rasa: "Veera (Heroic Meditation), Gambhir",
    aroha: "S g M d n S'",
    avaroha: "S' n d M g S",
    vadi: "ma (Shuddha Madhyam)",
    samvadi: "Sa (Shadja)",
    pakad: "g M d M g, M g S .n S",
    description: "Ancient pentatonic raga said to soothe Lord Shiva's cosmic fury. Strictly omits Rishabh (Re) and Pancham (Pa)."
  },
  {
    id: "kafi",
    name: "Kafi",
    tradition: "Hindustani / Carnatic",
    thaat: "Kafi",
    time_of_day: "Late Evening / Spring (Holi season)",
    rasa: "Sringara, Hori, Anand (Celebration)",
    aroha: "S R g M P D n S'",
    avaroha: "S' n D P M g R S",
    vadi: "Pa (Pancham)",
    samvadi: "Sa (Shadja)",
    pakad: "S R R g M P, M P D n D P",
    description: "The primary scale of folk, thumri, and hori traditions. Natural minor third and minor seventh."
  },
  {
    id: "todi",
    name: "Miyan Ki Todi",
    tradition: "Hindustani",
    thaat: "Todi",
    time_of_day: "Second Prahar of Morning (8 AM - 11 AM)",
    rasa: "Karuna, Utkantha (Yearning), Transcendental Pathos",
    aroha: "S r g M' P d N S'",
    avaroha: "S' N d P M' g r S",
    vadi: "dha (Komal Dhaivat)",
    samvadi: "ga (Komal Gandhar)",
    pakad: "r g r S, M' g, d P, M' g r g r S",
    description: "A monumental raga using Ati-Komal Re and Ga with Tivratara Ma. Intensely soulful and microtonally challenging."
  },
  {
    id: "hamsadhwani",
    name: "Hamsadhwani",
    tradition: "Carnatic / Adopted into Hindustani",
    thaat: "Shankarabharanam (29th Melakarta) / Bilawal",
    time_of_day: "Evening / Any Auspicious Beginning",
    rasa: "Anand, Bhakti, Mangal (Joyous Invocation)",
    aroha: "S R G P N S'",
    avaroha: "S' N P G R S",
    vadi: "Sa / Pa",
    samvadi: "Pa / Sa",
    pakad: "S R G P N S', N P G R S",
    description: "Created by Ramaswami Dikshitar ('Sound of Swans'). Pentatonic raga omitting Ma and Dha, creating sparkling spiritual brilliance."
  }
];

export default function RagasCatalogPage() {
  const [ragasList, setRagasList] = useState<RagaData[]>(SEED_RAGAS);
  const [search, setSearch] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('All');
  const [selectedThaat, setSelectedThaat] = useState('All');

  useEffect(() => {
    // Fetch dynamic ragas from backend if available
    ragasApi.getAll()
      .then((res: any) => {
        if (res.data && res.data.length > 0) {
          setRagasList(res.data);
        }
      })
      .catch(() => {
        // Fallback to seed catalog
      });
  }, []);

  // Filter ragas based on search, tradition, and thaat
  const filteredRagas = ragasList.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                          (r.thaat && r.thaat.toLowerCase().includes(search.toLowerCase())) ||
                          (r.pakad && r.pakad.toLowerCase().includes(search.toLowerCase()));
    const matchesTradition = selectedTradition === 'All' || r.tradition.toLowerCase().includes(selectedTradition.toLowerCase());
    const matchesThaat = selectedThaat === 'All' || (r.thaat && r.thaat.toLowerCase() === selectedThaat.toLowerCase());
    return matchesSearch && matchesTradition && matchesThaat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono mb-4 font-semibold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Classical Melodic Treasury</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight mb-3">
            Raga Explorer & Master Catalog
          </h1>
          <p className="text-sm text-slate-600">
            Explore canonical Hindustani & Carnatic ragas, their scale structures, signature Pakad phrases, and ideal times for Riyaz.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-4 rounded-2xl border border-amber-300 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center shadow-md">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Raga name or Thaat..."
              className="w-full bg-white border border-amber-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          {/* Tradition Filter */}
          <div>
            <select
              value={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All">All Traditions</option>
              <option value="Hindustani">Hindustani Tradition</option>
              <option value="Carnatic">Carnatic Tradition</option>
            </select>
          </div>

          {/* Thaat Filter */}
          <div>
            <select
              value={selectedThaat}
              onChange={(e) => setSelectedThaat(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="All">All Thaats / Parent Scales</option>
              <option value="Kalyan">Kalyan Thaat</option>
              <option value="Bhairav">Bhairav Thaat</option>
              <option value="Bhairavi">Bhairavi Thaat</option>
              <option value="Kafi">Kafi Thaat</option>
              <option value="Asavari">Asavari Thaat</option>
              <option value="Todi">Todi Thaat</option>
            </select>
          </div>

        </div>

        {/* Raga Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredRagas.map((raga) => (
            <RagaCard key={raga.id} raga={raga} />
          ))}
        </div>

        {filteredRagas.length === 0 && (
          <div className="text-center py-12 glass-card rounded-2xl border border-gray-800">
            <Music className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <div className="text-sm font-semibold text-white">No ragas matched your search</div>
            <div className="text-xs text-gray-400 mt-1">Try searching for &quot;Yaman&quot;, &quot;Bhairav&quot;, or &quot;Kalyan&quot;.</div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

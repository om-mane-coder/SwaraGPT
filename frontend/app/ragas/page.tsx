'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RagaCard, { RagaData } from '@/components/raga/RagaCard';
import { Search, Music } from 'lucide-react';
import { ragasApi } from '@/lib/api';

const SEED_RAGAS: RagaData[] = [
  {
    id: "yaman",
    name: "Yaman",
    tradition: "Hindustani",
    thaat: "Kalyan",
    time_of_day: "Evening (6 PM - 9 PM)",
    rasa: "Shanta, Sringara",
    aroha: "N R G, M' D N S'",
    avaroha: "S' N D P, M' G R S",
    vadi: "Ga",
    samvadi: "Ni",
    pakad: "N R G, R G M' P, D P M' G R, .N R S",
    description: "Features sharp Ma (Tivra Ma) and starts on Mandra Ni."
  },
  {
    id: "bhairav",
    name: "Bhairav",
    tradition: "Hindustani",
    thaat: "Bhairav",
    time_of_day: "Dawn (4 AM - 7 AM)",
    rasa: "Bhakti, Gambhir",
    aroha: "S r G M P d N S'",
    avaroha: "S' N d P M G r S",
    vadi: "dha (Komal)",
    samvadi: "re (Komal)",
    pakad: "G M (d)d P, G M (r)r S",
    description: "Dawn raga with microtonal oscillations on Komal Re and Komal Dha."
  },
  {
    id: "bhairavi",
    name: "Bhairavi",
    tradition: "Hindustani / Carnatic",
    thaat: "Bhairavi",
    time_of_day: "Morning / Concert Finale",
    rasa: "Karuna, Bhakti",
    aroha: "S r g M P d n S'",
    avaroha: "S' n d P M g r S",
    vadi: "ma",
    samvadi: "Sa",
    pakad: "M P d P M g, r S .n .d S",
    description: "Features all four komal notes (re, ga, dha, ni)."
  },
  {
    id: "bhupali",
    name: "Bhupali (Bhoop)",
    tradition: "Hindustani / Carnatic",
    thaat: "Kalyan",
    time_of_day: "Night (7 PM - 10 PM)",
    rasa: "Shanta, Bhakti",
    aroha: "S R G P D S'",
    avaroha: "S' D P G R S",
    vadi: "Ga",
    samvadi: "Dha",
    pakad: "S R G, P G, D P G R S",
    description: "Pentatonic raga omitting Ma and Ni."
  },
  {
    id: "bageshri",
    name: "Bageshri",
    tradition: "Hindustani",
    thaat: "Kafi",
    time_of_day: "Late Night",
    rasa: "Sringara",
    aroha: "S g M D n S'",
    avaroha: "S' n D, M P D g, M g R S",
    vadi: "Ma",
    samvadi: "Sa",
    pakad: "S .n D .n S, M, D n D M, M g R S",
    description: "Late-night melody omitting Pa in ascent."
  },
  {
    id: "darbari-kanada",
    name: "Darbari Kanada",
    tradition: "Hindustani",
    thaat: "Asavari",
    time_of_day: "Midnight",
    rasa: "Gambhir, Vairagya",
    aroha: "S R (g)g M P (d)d n S'",
    avaroha: "S' d n P, M P (g)g M R S",
    vadi: "re (Komal)",
    samvadi: "Pa",
    pakad: "S R (g)g M R S, d n P",
    description: "Slow, deep oscillations on Komal Ga and Komal Dha."
  },
  {
    id: "malkauns",
    name: "Malkauns",
    tradition: "Hindustani / Carnatic",
    thaat: "Bhairavi",
    time_of_day: "Midnight - 3 AM",
    rasa: "Veera, Gambhir",
    aroha: "S g M d n S'",
    avaroha: "S' n d M g S",
    vadi: "ma",
    samvadi: "Sa",
    pakad: "g M d M g, M g S .n S",
    description: "Pentatonic raga omitting Rishabh (Re) and Pancham (Pa)."
  },
  {
    id: "kafi",
    name: "Kafi",
    tradition: "Hindustani",
    thaat: "Kafi",
    time_of_day: "Evening",
    rasa: "Anand, Sringara",
    aroha: "S R g M P D n S'",
    avaroha: "S' n D P M g R S",
    vadi: "Pa",
    samvadi: "Sa",
    pakad: "S R R g M P, M P D n D P",
    description: "Natural minor third and minor seventh."
  },
  {
    id: "todi",
    name: "Miyan Ki Todi",
    tradition: "Hindustani",
    thaat: "Todi",
    time_of_day: "Morning (8 AM - 11 AM)",
    rasa: "Karuna, Pathos",
    aroha: "S r g M' P d N S'",
    avaroha: "S' N d P M' g r S",
    vadi: "dha (Komal)",
    samvadi: "ga (Komal)",
    pakad: "r g r S, M' g, d P, M' g r g r S",
    description: "Features Komal Re, Komal Ga, and Tivra Ma."
  },
  {
    id: "hamsadhwani",
    name: "Hamsadhwani",
    tradition: "Carnatic / Hindustani",
    thaat: "Bilawal",
    time_of_day: "Evening",
    rasa: "Anand, Bhakti",
    aroha: "S R G P N S'",
    avaroha: "S' N P G R S",
    vadi: "Sa",
    samvadi: "Pa",
    pakad: "S R G P N S', N P G R S",
    description: "Pentatonic raga omitting Ma and Dha."
  }
];

export default function RagasCatalogPage() {
  const [ragasList, setRagasList] = useState<RagaData[]>(SEED_RAGAS);
  const [search, setSearch] = useState('');
  const [selectedTradition, setSelectedTradition] = useState('All');
  const [selectedThaat, setSelectedThaat] = useState('All');

  useEffect(() => {
    ragasApi.getAll()
      .then((res: any) => {
        if (res.data && res.data.length > 0) {
          setRagasList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredRagas = ragasList.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                          (r.thaat && r.thaat.toLowerCase().includes(search.toLowerCase())) ||
                          (r.pakad && r.pakad.toLowerCase().includes(search.toLowerCase()));
    const matchesTradition = selectedTradition === 'All' || r.tradition.toLowerCase().includes(selectedTradition.toLowerCase());
    const matchesThaat = selectedThaat === 'All' || (r.thaat && r.thaat.toLowerCase() === selectedThaat.toLowerCase());
    return matchesSearch && matchesTradition && matchesThaat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1.5">
            Raga Directory
          </h1>
          <p className="text-xs text-slate-500">
            Scales, swaras, and signature phrases for Indian classical riyaz.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center shadow-2xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by raga or thaat..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <select
              value={selectedTradition}
              onChange={(e) => setSelectedTradition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All Traditions</option>
              <option value="Hindustani">Hindustani</option>
              <option value="Carnatic">Carnatic</option>
            </select>
          </div>

          <div>
            <select
              value={selectedThaat}
              onChange={(e) => setSelectedThaat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="All">All Thaats</option>
              <option value="Kalyan">Kalyan</option>
              <option value="Bhairav">Bhairav</option>
              <option value="Bhairavi">Bhairavi</option>
              <option value="Kafi">Kafi</option>
              <option value="Asavari">Asavari</option>
              <option value="Todi">Todi</option>
              <option value="Bilawal">Bilawal</option>
            </select>
          </div>
        </div>

        {/* Raga Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {filteredRagas.map((raga) => (
            <RagaCard key={raga.id} raga={raga} />
          ))}
        </div>

        {filteredRagas.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <Music className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-700">No ragas matched your search</div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';

export interface ShrutiInfo {
  index: number;
  name: string;
  sanskrit: string;
  swara: string;
  swara_type: string;
  cents: number;
  ratio_str: string;
  rasa: string;
}

export const CANONICAL_SHRUTIS: ShrutiInfo[] = [
  { index: 1, name: "Tivra", sanskrit: "तीव्रा", swara: "Sa", swara_type: "Shadja (Achal)", cents: 0.0, ratio_str: "1/1", rasa: "Shanta (Peaceful)" },
  { index: 2, name: "Kumudvati", sanskrit: "कुमुद्वती", swara: "Sa+", swara_type: "Microtone Sa", cents: 21.5, ratio_str: "81/80", rasa: "Yearning" },
  { index: 3, name: "Manda", sanskrit: "मन्दा", swara: "re-", swara_type: "Ati-Komal Re", cents: 70.7, ratio_str: "25/24", rasa: "Dawn Twilight (Bhairav)" },
  { index: 4, name: "Chandovati", sanskrit: "छन्दोवती", swara: "re", swara_type: "Komal Re", cents: 111.7, ratio_str: "16/15", rasa: "Karuna, Bhakti (Todi, Asavari)" },
  { index: 5, name: "Dayavati", sanskrit: "दयावती", swara: "Re-", swara_type: "Trishruti Re", cents: 182.4, ratio_str: "10/9", rasa: "Compassion (Kafi)" },
  { index: 6, name: "Ranjani", sanskrit: "रञ्जनी", swara: "Re", swara_type: "Chatushruti Re (Shuddha)", cents: 203.9, ratio_str: "9/8", rasa: "Veera (Yaman, Bilawal, Bhupali)" },
  { index: 7, name: "Raktika", sanskrit: "रक्तिका", swara: "ga-", swara_type: "Ati-Komal Ga", cents: 294.1, ratio_str: "32/27", rasa: "Solemn (Darbari Kanada)" },
  { index: 8, name: "Raudri", sanskrit: "रौद्री", swara: "ga", swara_type: "Komal Ga", cents: 315.6, ratio_str: "6/5", rasa: "Tender Sringara (Bageshri, Kafi)" },
  { index: 9, name: "Krodha", sanskrit: "क्रोधा", swara: "Ga", swara_type: "Shuddha Ga (Antara)", cents: 386.3, ratio_str: "5/4", rasa: "Joyous Light (Yaman, Bhoop)" },
  { index: 10, name: "Vajrika", sanskrit: "वज्रिका", swara: "Ga+", swara_type: "Tivra Ga", cents: 407.8, ratio_str: "81/64", rasa: "Intensity (Shankara)" },
  { index: 11, name: "Prasarini", sanskrit: "प्रसारिणी", swara: "Ma", swara_type: "Shuddha Ma", cents: 498.0, ratio_str: "4/3", rasa: "Nurturing (Malkauns, Bhairavi)" },
  { index: 12, name: "Priti", sanskrit: "प्रीति", swara: "Ma+", swara_type: "Tivra Ma (Lower)", cents: 519.5, ratio_str: "27/20", rasa: "Affection (Lalit)" },
  { index: 13, name: "Marjani", sanskrit: "मार्जनी", swara: "ma'", swara_type: "Tivra Ma (Prati)", cents: 590.2, ratio_str: "45/32", rasa: "Twilight Wonder (Yaman, Marwa)" },
  { index: 14, name: "Kshiti", sanskrit: "क्षिति", swara: "ma''", swara_type: "Tivratara Ma", cents: 609.8, ratio_str: "64/45", rasa: "Urgency (Todi, Multani)" },
  { index: 15, name: "Rakta", sanskrit: "रक्ता", swara: "Pa", swara_type: "Pancham (Achal)", cents: 702.0, ratio_str: "3/2", rasa: "Cosmic Balance" },
  { index: 16, name: "Sandipani", sanskrit: "संदीपनी", swara: "Pa+", swara_type: "Microtone Pa", cents: 723.5, ratio_str: "243/160", rasa: "Kindling Passion" },
  { index: 17, name: "Alapini", sanskrit: "आलापिनी", swara: "dha-", swara_type: "Ati-Komal Dha", cents: 792.2, ratio_str: "128/81", rasa: "Nocturnal Gravity (Darbari, Asavari)" },
  { index: 18, name: "Madanti", sanskrit: "मदन्ती", swara: "dha", swara_type: "Komal Dha", cents: 813.7, ratio_str: "8/5", rasa: "Devotion (Bhairav, Malkauns)" },
  { index: 19, name: "Rohini", sanskrit: "रोहिणी", swara: "Dha", swara_type: "Chatushruti Dha (Shuddha)", cents: 884.4, ratio_str: "5/3", rasa: "Auspicious Grandeur (Yaman, Bhoop)" },
  { index: 20, name: "Ramya", sanskrit: "रम्यास", swara: "Dha+", swara_type: "Tivra Dha", cents: 905.9, ratio_str: "27/16", rasa: "Enchanting" },
  { index: 21, name: "Ugra", sanskrit: "उग्रा", swara: "ni", swara_type: "Komal Ni (Kaisiki)", cents: 1017.6, ratio_str: "9/5", rasa: "Soulful Yearning (Kafi, Khamaj)" },
  { index: 22, name: "Kshobhini", sanskrit: "क्षोभिणी", swara: "Ni", swara_type: "Shuddha Ni (Kakali)", cents: 1088.3, ratio_str: "15/8", rasa: "Ecstatic Surrender to Taar Sa" },
];

interface ShrutiDialProps {
  currentCents?: number;
  nearestShrutiName?: string;
  className?: string;
}

export default function ShrutiDial({
  currentCents = 0,
  nearestShrutiName,
  className = '',
}: ShrutiDialProps) {
  const [selectedShruti, setSelectedShruti] = useState<ShrutiInfo>(CANONICAL_SHRUTIS[0]);

  // Radius configuration for SVG rendering
  const size = 320;
  const center = size / 2;
  const outerRadius = 130;
  const innerRadius = 90;

  // Map cents [0, 1200] to angle in radians. Start at top (-90 degrees)
  const centsToAngle = (c: number) => {
    const normalizedCents = ((c % 1200) + 1200) % 1200;
    return (normalizedCents / 1200) * 2 * Math.PI - Math.PI / 2;
  };

  const needleAngle = centsToAngle(currentCents);
  const needleX = center + innerRadius * 0.9 * Math.cos(needleAngle);
  const needleY = center + innerRadius * 0.9 * Math.sin(needleAngle);

  return (
    <div className={`glass-card p-6 rounded-2xl border border-amber-500/20 flex flex-col items-center ${className}`}>
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">22-Shruti Radial Intonation</h3>
        </div>
        <span className="text-[11px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          Natya Shastra
        </span>
      </div>

      <p className="text-[11px] text-gray-400 text-center mb-4 max-w-xs">
        Analytical 22-shruti reference system mapping subtle microtonal intonations across the octave.
      </p>

      {/* SVG Radial Wheel */}
      <div className="relative w-[320px] h-[320px]">
        <svg width={size} height={size} className="overflow-visible">
          {/* Outer circle track */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Inner decorative circle */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="#090D16"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* 22 Shruti tick marks and clickable nodes */}
          {CANONICAL_SHRUTIS.map((shruti) => {
            const angle = centsToAngle(shruti.cents);
            const xOuter = center + outerRadius * Math.cos(angle);
            const yOuter = center + outerRadius * Math.sin(angle);
            const xInner = center + (innerRadius + 8) * Math.cos(angle);
            const yInner = center + (innerRadius + 8) * Math.sin(angle);

            const isSelected = selectedShruti.index === shruti.index;
            const isNearest = nearestShrutiName === shruti.name;

            // Highlight major swaras (Sa, Re, Ga, Ma, Pa, Dha, Ni)
            const isMajorSwara = ["Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"].includes(shruti.swara);

            return (
              <g
                key={shruti.index}
                className="cursor-pointer group"
                onClick={() => setSelectedShruti(shruti)}
              >
                {/* Radial tick line */}
                <line
                  x1={xInner}
                  y1={yInner}
                  x2={xOuter}
                  y2={yOuter}
                  stroke={isNearest ? '#F59E0B' : isSelected ? '#38BDF8' : isMajorSwara ? '#E2E8F0' : '#475569'}
                  strokeWidth={isNearest || isSelected ? 2.5 : isMajorSwara ? 2 : 1}
                />

                {/* Shruti node circle */}
                <circle
                  cx={xOuter}
                  cy={yOuter}
                  r={isNearest ? 6 : isSelected ? 5.5 : isMajorSwara ? 4.5 : 3}
                  fill={isNearest ? '#F59E0B' : isSelected ? '#38BDF8' : isMajorSwara ? '#F8FAFC' : '#64748B'}
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Shruti label for major nodes */}
                {isMajorSwara && (
                  <text
                    x={center + (outerRadius + 16) * Math.cos(angle)}
                    y={center + (outerRadius + 16) * Math.sin(angle) + 4}
                    fill={isNearest ? '#F59E0B' : '#E2E8F0'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {shruti.swara}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Pitch Needle */}
          {currentCents > 0 && (
            <>
              <line
                x1={center}
                y1={center}
                x2={needleX}
                y2={needleY}
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-100"
              />
              <circle
                cx={needleX}
                cy={needleY}
                r="4.5"
                fill="#EF4444"
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
            </>
          )}

          {/* Center Hub Indicator */}
          <circle cx={center} cy={center} r="18" fill="#111827" stroke="#F59E0B" strokeWidth="2" />
          <text
            x={center}
            y={center + 4}
            textAnchor="middle"
            fill="#F59E0B"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {Math.round(currentCents)}¢
          </text>
        </svg>
      </div>

      {/* Selected / Nearest Shruti Details Card */}
      <div className="w-full mt-4 p-4 rounded-xl bg-[#090D16] border border-gray-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-amber-400 font-serif">
              {selectedShruti.name}
            </span>
            <span className="text-xs text-gray-400 font-sans">
              ({selectedShruti.sanskrit})
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
            {selectedShruti.swara} ({selectedShruti.cents.toFixed(1)}¢)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 font-mono mt-2 pt-2 border-t border-gray-800/60">
          <div>
            <span className="text-gray-500">Ratio: </span>
            <span>{selectedShruti.ratio_str}</span>
          </div>
          <div>
            <span className="text-gray-500">Type: </span>
            <span className="text-amber-200/90">{selectedShruti.swara_type}</span>
          </div>
          <div className="col-span-2 text-[11px] text-gray-400 italic font-sans flex items-center gap-1.5 mt-0.5">
            <Info className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
            <span>Rasa / Context: {selectedShruti.rasa}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

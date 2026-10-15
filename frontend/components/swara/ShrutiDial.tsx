'use client';

import React, { useState } from 'react';

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
  { index: 22, name: "Kshobhini", sanskrit: "क्षोभिणी", swara: "Ni", swara_type: "Shuddha Ni (Kakali)", cents: 1088.3, ratio_str: "15/8", rasa: "Taar Sa Transition" },
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

  const size = 300;
  const center = size / 2;
  const outerRadius = 120;
  const innerRadius = 82;

  const centsToAngle = (c: number) => {
    const normalizedCents = ((c % 1200) + 1200) % 1200;
    return (normalizedCents / 1200) * 2 * Math.PI - Math.PI / 2;
  };

  const needleAngle = centsToAngle(currentCents);
  const needleX = center + innerRadius * 0.9 * Math.cos(needleAngle);
  const needleY = center + innerRadius * 0.9 * Math.sin(needleAngle);

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center ${className}`}>
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-800">22-Shruti Microtones</h3>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {Math.round(currentCents)}¢
        </span>
      </div>

      {/* SVG Radial Wheel */}
      <div className="relative w-[300px] h-[300px]">
        <svg width={size} height={size} className="overflow-visible">
          {/* Outer track */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Inner decorative circle */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          {/* 22 Shruti nodes */}
          {CANONICAL_SHRUTIS.map((shruti) => {
            const angle = centsToAngle(shruti.cents);
            const xOuter = center + outerRadius * Math.cos(angle);
            const yOuter = center + outerRadius * Math.sin(angle);
            const xInner = center + (innerRadius + 6) * Math.cos(angle);
            const yInner = center + (innerRadius + 6) * Math.sin(angle);

            const isSelected = selectedShruti.index === shruti.index;
            const isNearest = nearestShrutiName === shruti.name;
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
                  stroke={isNearest ? '#0F172A' : isSelected ? '#334155' : isMajorSwara ? '#94A3B8' : '#CBD5E1'}
                  strokeWidth={isNearest || isSelected ? 2 : isMajorSwara ? 1.5 : 1}
                />

                {/* Shruti node circle */}
                <circle
                  cx={xOuter}
                  cy={yOuter}
                  r={isNearest ? 5 : isSelected ? 4.5 : isMajorSwara ? 3.5 : 2.5}
                  fill={isNearest ? '#0F172A' : isSelected ? '#334155' : isMajorSwara ? '#64748B' : '#CBD5E1'}
                />

                {/* Shruti label for major nodes */}
                {isMajorSwara && (
                  <text
                    x={center + (outerRadius + 14) * Math.cos(angle)}
                    y={center + (outerRadius + 14) * Math.sin(angle) + 3.5}
                    fill={isNearest ? '#0F172A' : '#64748B'}
                    fontSize="10"
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
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx={needleX}
                cy={needleY}
                r="3.5"
                fill="#10B981"
                stroke="#0F172A"
                strokeWidth="1"
              />
            </>
          )}

          {/* Center Hub Indicator */}
          <circle cx={center} cy={center} r="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <text
            x={center}
            y={center + 3.5}
            textAnchor="middle"
            fill="#334155"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {Math.round(currentCents)}¢
          </text>
        </svg>
      </div>

      {/* Selected Shruti Details Pill */}
      <div className="w-full mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-800">
            {selectedShruti.name} <span className="text-slate-400 font-normal">({selectedShruti.sanskrit})</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            {selectedShruti.swara} • {selectedShruti.cents.toFixed(1)}¢
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1 flex justify-between">
          <span>Ratio: {selectedShruti.ratio_str}</span>
          <span>{selectedShruti.swara_type}</span>
        </div>
      </div>
    </div>
  );
}

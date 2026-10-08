import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  experience_level: string;
  tradition: string;
  preferred_tonic: string;
  preferred_tonic_hz: number;
  daily_goal_minutes: number;
  target_ragas: string[];
  strong_swaras: string[];
  weak_swaras: string[];
  current_streak_days: number;
  total_practice_minutes: number;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  bio?: string;
  profile?: UserProfile;
}

export interface LastPerformanceReport {
  session_id?: string;
  overall_score?: number;
  score?: number;
  target_raga?: string;
  detected_raga?: string;
  raga_match?: any;
  raga_confidence?: number;
  pitch_accuracy?: number;
  swara_accuracy?: number;
  shruti_accuracy?: number;
  raga_accuracy?: number;
  tonic_stability?: number;
  pitch_stability?: number;
  shruti_precision?: number;
  tonic?: {
    estimated_sa_hz?: number;
    nearest_western_note?: string;
  };
  strong_swaras?: string[];
  weak_swaras?: string[];
  feedback_text?: string;
  recommendations?: string[];
  pitch_contour?: any[];
  pitch_points?: any[];
  swara_timeline?: any[];
  ornament_segments?: any[];
  [key: string]: any;
}

interface SwaraState {
  user: User | null;
  token: string | null;
  selectedTonic: string;
  selectedTonicHz: number;
  selectedRaga: string;
  lastAnalysis: LastPerformanceReport | null;
  
  setUser: (user: User | null, token: string | null) => void;
  setSelectedTonic: (tonic: string | number, hz?: number) => void;
  setSelectedRaga: (raga: string) => void;
  setLastAnalysis: (analysis: LastPerformanceReport | null) => void;
  logout: () => void;
}

export const useSwaraStore = create<SwaraState>()(
  persist(
    (set) => ({
      user: {
        id: 2,
        name: "Om Mane",
        email: "student@swaragpt.ai",
        role: "student",
        profile: {
          experience_level: "Intermediate",
          tradition: "Hindustani",
          preferred_tonic: "C3",
          preferred_tonic_hz: 130.81,
          daily_goal_minutes: 25,
          target_ragas: ["Yaman", "Bhupali", "Bhairav"],
          strong_swaras: ["Sa", "Pa", "Shuddha Re"],
          weak_swaras: ["Shuddha Ga", "Tivra Ma"],
          current_streak_days: 7,
          total_practice_minutes: 340,
        }
      },
      token: "demo-jwt-token-active",
      selectedTonic: "C#3",
      selectedTonicHz: 138.59,
      selectedRaga: "Yaman",
      lastAnalysis: null,

      setUser: (user, token) => set({ user, token }),
      setSelectedTonic: (tonic, hz) => {
        if (typeof tonic === 'number') {
          set({ selectedTonic: `${tonic.toFixed(1)} Hz`, selectedTonicHz: tonic });
        } else {
          set({ selectedTonic: tonic, selectedTonicHz: hz ?? 138.59 });
        }
      },
      setSelectedRaga: (raga) => set({ selectedRaga: raga }),
      setLastAnalysis: (analysis) => set({ lastAnalysis: analysis }),
      logout: () => set({ user: null, token: null, lastAnalysis: null }),
    }),
    {
      name: 'swara-storage',
    }
  )
);

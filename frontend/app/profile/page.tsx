'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  User, Mail, Music, Award, Clock, Save, 
  CheckCircle, Shield, AlertTriangle 
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';
import { authApi } from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser, selectedTonic, setSelectedTonic, selectedRaga, setSelectedRaga } = useSwaraStore();

  const [name, setName] = useState(user?.name || 'Om');
  const [email, setEmail] = useState(user?.email || 'sadhak@swaragpt.ai');
  const [experience, setExperience] = useState('Intermediate');
  const [tradition, setTradition] = useState('Hindustani');
  const [tonicHz, setTonicHz] = useState(selectedTonic || 138.59);
  const [targetRaga, setTargetRaga] = useState(selectedRaga || 'Yaman');
  const [dailyGoal, setDailyGoal] = useState(30);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authApi.getMe()
      .then((res) => {
        if (res.data) {
          setName(res.data.name || name);
          setEmail(res.data.email || email);
          if (res.data.profile) {
            setExperience(res.data.profile.experience_level || experience);
            setTradition(res.data.profile.tradition || tradition);
            setTonicHz(res.data.profile.preferred_tonic_hz || tonicHz);
            setDailyGoal(res.data.profile.daily_goal_minutes || dailyGoal);
          }
        }
      })
      .catch(() => {
        // demo fallback
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await authApi.updateProfile({
        name,
        experience_level: experience.toLowerCase(),
        tradition: tradition.toLowerCase(),
        preferred_tonic_hz: tonicHz,
        daily_goal_minutes: dailyGoal,
      });
      setSelectedTonic(tonicHz);
      setSelectedRaga(targetRaga);
      setSaveSuccess(true);
    } catch {
      // In demo mode
      setSelectedTonic(tonicHz);
      setSelectedRaga(targetRaga);
      setSaveSuccess(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-black font-extrabold text-2xl shadow-xl shadow-amber-500/20">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">{name}&apos;s Sadhak Profile</h1>
            <p className="text-xs text-gray-400 font-mono">{email} • Role: {user?.role || 'Classical Student'}</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Profile and musical preferences successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-2xl border border-amber-500/20 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Email Address:</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#090D16]/50 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Classical Tradition */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Primary Tradition:</label>
              <select
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Hindustani">Hindustani Tradition</option>
                <option value="Carnatic">Carnatic Tradition</option>
                <option value="Both">Both (Universal Sadhana)</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Experience Level:</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Beginner">Beginner (Prathamik / Basic Swaras)</option>
                <option value="Intermediate">Intermediate (Madhyama / Ragas & Bandishes)</option>
                <option value="Advanced">Advanced (Visharad / Complex Taans & Layakari)</option>
              </select>
            </div>

            {/* Preferred Sa Tonic */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Preferred Tonic Sa (Hz):</label>
              <input
                type="number"
                step="0.01"
                value={tonicHz}
                onChange={(e) => setTonicHz(parseFloat(e.target.value) || 130.81)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Target Raga */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Target Raga:</label>
              <input
                type="text"
                value={targetRaga}
                onChange={(e) => setTargetRaga(e.target.value)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Daily Goal Minutes */}
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-2">Daily Practice Goal (Minutes):</label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value) || 30)}
                className="w-full bg-[#090D16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </main>

      <Footer />
    </div>
  );
}

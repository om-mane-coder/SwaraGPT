import { findNearestShruti, CANONICAL_SWARA_CENTERS, RAGA_SHRUTI_PREFERENCES } from '../lib/mir/shrutis';
import { SwaraMIRCIEngine } from '../lib/mir/engine';
import { SwaraEvent } from '../lib/mir/types';

console.log("=== 1. VERIFYING 22-SHRUTI & JUST INTONATION PRECISION ===");

// Test 1: Shuddha Gandhar (pure 5/4 harmonic = 386.31 cents) in Yaman
const gaCents = 386.3;
const gaMatch = findNearestShruti(gaCents, "Yaman");
console.log(`Shuddha Ga (386.3¢) -> Shruti: ${gaMatch.shruti_name}, Swara: ${gaMatch.swara}, Delta: ${gaMatch.delta_cents}¢, Status: ${gaMatch.status}`);
if (Math.abs(gaMatch.delta_cents) > 0.5 || gaMatch.canonical_swara !== "Ga") {
  console.error("FAIL: Shuddha Ga did not match 386.3¢ center!");
  process.exit(1);
}

// Test 2: Tivra Madhyam (pure 45/32 = 590.22 cents) in Yaman
const maTivraCents = 590.2;
const maMatch = findNearestShruti(maTivraCents, "Yaman");
console.log(`Tivra Ma' (590.2¢) -> Shruti: ${maMatch.shruti_name}, Swara: ${maMatch.swara}, Delta: ${maMatch.delta_cents}¢, Status: ${maMatch.status}`);
if (Math.abs(maMatch.delta_cents) > 0.5 || maMatch.canonical_swara !== "Ma'") {
  console.error("FAIL: Tivra Ma did not match 590.2¢ center!");
  process.exit(1);
}

// Test 3: Ati-Komal Ga (Raktika 294.1 cents) in Darbari
const darbariGaCents = 295.0;
const darbariGaMatch = findNearestShruti(darbariGaCents, "Darbari");
console.log(`Darbari Ati-Komal Ga (295.0¢) -> Shruti: ${darbariGaMatch.shruti_name}, Swara: ${darbariGaMatch.swara}, Delta: ${darbariGaMatch.delta_cents}¢`);
if (darbariGaMatch.shruti_name !== "Raktika") {
  console.error("FAIL: Darbari Ga did not match Raktika!");
  process.exit(1);
}

console.log("\n=== 2. VERIFYING RAGA RECOGNITION PRECISION ===");

function makeEvents(sequence: string[], durations?: number[]): SwaraEvent[] {
  let t = 0;
  return sequence.map((sw, idx) => {
    const dur = durations ? durations[idx] : 0.6;
    const start = t;
    t += dur;
    return {
      swara: sw,
      swara_type: `${sw} (Madhya)`,
      shruti_name: "Tivra",
      octave: "Madhya" as const,
      start_time: start,
      end_time: t,
      duration: dur,
      mean_pitch: 138.59,
      cents_from_sa: 0,
      cents_deviation: 2.0,
      accuracy: 94.0,
      stability: 92.0,
      intonation_status: "Exact Sur",
      is_in_tune: true
    };
  });
}

// Test 2A: Bhupali Pakad & Chalan (pentatonic Sa, Re, Ga, Pa, Dha with Ga vadi nyasa)
const bhupaliEvents = makeEvents(
  ["Ga", "Re", "Sa", "Dha", "Sa", "Re", "Ga", "Pa", "Ga", "Dha", "Pa", "Ga"],
  [1.2, 0.5, 0.7, 0.6, 0.4, 0.5, 1.4, 0.6, 1.2, 0.7, 0.5, 1.5]
);
// @ts-ignore
const bhupaliResults = SwaraMIRCIEngine.recognizeRaga(bhupaliEvents);
console.log("Bhupali phrase detection top candidates:");
bhupaliResults.forEach((c: any, i: number) => console.log(`  #${i+1}: ${c.raga_name} (${c.confidence}) - Scale: ${c.scale_adherence}%, Vadi: ${c.vadi_adherence}%, Pakad: ${c.pakad_match_score}%`));
if (bhupaliResults[0].raga_name !== "Bhupali") {
  console.error(`FAIL: Expected Bhupali #1, got ${bhupaliResults[0].raga_name}`);
  process.exit(1);
}

// Test 2B: Yaman Pakad & Chalan (Ni. Re Ga Ma' Dha Ni Sa' / Sa' Ni Dha Pa Ma' Ga Re Sa)
const yamanEvents = makeEvents(
  ["Ni", "Re", "Ga", "Ma'", "Dha", "Ni", "Sa", "Ni", "Dha", "Pa", "Ma'", "Ga", "Re", "Sa"],
  [0.8, 0.5, 1.5, 0.7, 0.6, 0.5, 0.9, 0.4, 0.5, 0.8, 0.6, 1.4, 0.6, 1.0]
);
// @ts-ignore
const yamanResults = SwaraMIRCIEngine.recognizeRaga(yamanEvents);
console.log("\nYaman phrase detection top candidates:");
yamanResults.forEach((c: any, i: number) => console.log(`  #${i+1}: ${c.raga_name} (${c.confidence}) - Scale: ${c.scale_adherence}%, Vadi: ${c.vadi_adherence}%, Pakad: ${c.pakad_match_score}%`));
if (yamanResults[0].raga_name !== "Yaman") {
  console.error(`FAIL: Expected Yaman #1, got ${yamanResults[0].raga_name}`);
  process.exit(1);
}

// Test 2C: Malkauns Pakad (Sa ga Ma dha ni Sa, strictly omitting Re and Pa)
const malkaunsEvents = makeEvents(
  ["Sa", "ga", "Ma", "dha", "Ma", "ga", "Ma", "ga", "Sa", "dha", "ni", "Sa"],
  [0.6, 0.8, 1.6, 0.9, 1.2, 0.7, 1.4, 0.6, 0.9, 0.7, 0.6, 1.0]
);
// @ts-ignore
const malkaunsResults = SwaraMIRCIEngine.recognizeRaga(malkaunsEvents);
console.log("\nMalkauns phrase detection top candidates:");
malkaunsResults.forEach((c: any, i: number) => console.log(`  #${i+1}: ${c.raga_name} (${c.confidence}) - Scale: ${c.scale_adherence}%, Vadi: ${c.vadi_adherence}%, Pakad: ${c.pakad_match_score}%`));
if (malkaunsResults[0].raga_name !== "Malkauns") {
  console.error(`FAIL: Expected Malkauns #1, got ${malkaunsResults[0].raga_name}`);
  process.exit(1);
}

// Test 2D: Bhairav Pakad (Ga Ma dha dha Pa Ma Ga re re Sa with dha/re vadi andolan)
const bhairavEvents = makeEvents(
  ["Ga", "Ma", "dha", "dha", "Pa", "Ma", "Ga", "re", "re", "Sa"],
  [0.6, 0.8, 1.4, 1.1, 0.9, 0.6, 0.7, 1.3, 1.0, 1.2]
);
// @ts-ignore
const bhairavResults = SwaraMIRCIEngine.recognizeRaga(bhairavEvents);
console.log("\nBhairav phrase detection top candidates:");
bhairavResults.forEach((c: any, i: number) => console.log(`  #${i+1}: ${c.raga_name} (${c.confidence}) - Scale: ${c.scale_adherence}%, Vadi: ${c.vadi_adherence}%, Pakad: ${c.pakad_match_score}%`));
if (bhairavResults[0].raga_name !== "Bhairav") {
  console.error(`FAIL: Expected Bhairav #1, got ${bhairavResults[0].raga_name}`);
  process.exit(1);
}

console.log("\n>>> ALL TESTS PASSED WITH 100% PRECISION! <<<");

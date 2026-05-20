import { useState, useCallback } from "react";

// ─── HYPERTROPHY 365 V2 ───────────────────────────────────────────────────────
// TRUE 5-DAY PPL SPLIT — Optimized for Maximum Muscle Size
//
// Split: Mon=Push A · Tue=Pull A · Wed=Legs · Thu=Push B · Fri=Pull B
// Rest: Sat + Sun
//
// Why this beats the old 4-day program:
// - Each muscle hit 2x/week with DEDICATED sessions (not mixed)
// - Push A vs Push B = different angle/rep scheme emphasis = more total stimulus
// - Arm specialization built into Pull days (not tacked on)
// - Rear delt + rotator cuff gets its own consistent volume
// - Legs day = full lower body in one session, higher frequency than before
// - 20-22 sets/muscle/week at peak phase (vs 18-20 before)
//
// 5 Phases over 52 weeks:
// Phase 1 – Volume Foundation    (Wks  1–8):  Accumulate volume, build work capacity
// Phase 2 – Hypertrophy Drive    (Wks  9–20): Peak volume, 20+ sets/muscle/wk
// Phase 3 – Intensification      (Wks 21–30): Load increases, advanced techniques
// Phase 4 – Strength-Size        (Wks 31–42): Heavy compound + high-rep iso
// Phase 5 – Specialization Peak  (Wks 43–52): Lagging muscle focus, deload cycling

const PHASES = [
  { name: "Volume Foundation",   weeks: [1,8],   focus: "4×10-12 | RPE 7-8 | 15-18 sets/muscle/wk | Build the base", color: "#00C9A7" },
  { name: "Hypertrophy Drive",   weeks: [9,20],  focus: "4-5×8-12 | RPE 8 | 20-22 sets/muscle/wk | Peak volume block", color: "#4FACFE" },
  { name: "Intensification",     weeks: [21,30], focus: "4-5×6-10 | RPE 8-9 | Slow eccentrics + advanced techniques", color: "#F7971E" },
  { name: "Strength-Size",       weeks: [31,42], focus: "5×4-8 compound / 10-15 iso | RPE 9 | Heavy & hard", color: "#C471ED" },
  { name: "Specialization Peak", weeks: [43,52], focus: "4×8-12 | Lagging muscles prioritized | Deload every 4th wk", color: "#FF6B6B" },
];

// Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
const SESSION_MAP  = { 1:"A", 2:"B", 3:"C", 4:"D", 5:"E", 6:null, 0:null };
const SESSION_COLORS = { A:"#FF6B6B", B:"#4FACFE", C:"#00C9A7", D:"#F7971E", E:"#C471ED" };
const SESSION_LABELS = {
  A: "Push A · Chest/Shoulders/Tris",
  B: "Pull A · Back/Biceps/Rear Delt",
  C: "Legs · Quad/Ham/Glute/Calf",
  D: "Push B · Shoulders/Chest/Tris",
  E: "Pull B · Back/Arms/Rear Delt",
};

function getPhaseNum(w) {
  for (let i = 0; i < PHASES.length; i++) {
    if (w >= PHASES[i].weeks[0] && w <= PHASES[i].weeks[1]) return i + 1;
  }
  return 5;
}
function getBlock(w) { return Math.floor((w - 1) / 4) % 3; }

function isDeload(w) {
  if ([20, 28, 30, 38, 42].includes(w)) return true;
  if (w >= 43 && (w - 43) % 4 === 3) return true;
  return false;
}

function getSR(phase) {
  return [
    { sets: "4",   comp: "10-12", iso: "12-15", arm: "12-15" },
    { sets: "4-5", comp: "8-12",  iso: "10-12", arm: "10-12" },
    { sets: "4-5", comp: "6-10",  iso: "10-12", arm: "10-12" },
    { sets: "5",   comp: "4-8",   iso: "8-12",  arm: "10-12" },
    { sets: "4",   comp: "8-12",  iso: "10-15", arm: "12-15" },
  ][phase - 1] || { sets: "4", comp: "8-12", iso: "12-15", arm: "12-15" };
}

function getTech(phase, block) {
  if (phase < 3) return "";
  const tech = [
    ["2-sec eccentric", "Pause at peak contraction", "1.5-rep method"],
    ["Drop set on last set", "Rest-pause (10+5)", "Mechanical drop set"],
    ["Double rest-pause", "Triple drop set", "21s (7/7/7)"],
    ["Double rest-pause", "Heavy partials at top", "Slow eccentric + squeeze"],
    ["Drop set", "Rest-pause", "Slow eccentric"],
  ][phase - 1];
  return tech[block % 3];
}

function ex(name, sets, reps, notes) { return { exercise: name, sets, reps, notes: notes || "" }; }

// ── EXERCISE SELECTION HELPERS ────────────────────────────────────────────────
// pick(array[phase-1][block]) — 5 phase rows × 3 block cols
function pick(table, p, b) { return table[Math.min(p-1, table.length-1)][b % 3]; }

function getWorkout(session, weekNum) {
  const p  = getPhaseNum(weekNum);
  const b  = getBlock(weekNum);
  const sr = getSR(p);
  const t  = getTech(p, b);
  const adv = p >= 3 ? t : "";

  // ── SESSION A: PUSH A — Chest Focus + Shoulders + Triceps ────────────────
  if (session === "A") {
    const chestComp = pick([
      [["Barbell Bench Press","DB Bench Press","Weighted Dip"]],
      [["Barbell Bench Press","DB Bench (2-sec ecc)","Barbell Bench (pause)"]],
      [["Barbell Bench (rest-pause)","DB Bench (drop set)","Barbell Bench (1.5-rep)"]],
      [["Barbell Bench Press (heavy)","Close-Grip Bench Press","DB Bench (mech drop)"]],
      [["Barbell Bench Press","DB Bench Press","Weighted Dip"]],
    ], p, b);
    const chestInc = pick([
      [["DB Incline Press","Cable Incline Fly","Machine Incline Press"]],
      [["DB Incline Press","DB Incline (2-sec lower)","High-to-Low Cable Fly"]],
      [["DB Incline (rest-pause)","DB Incline (drop set)","DB Incline (1.5-rep)"]],
      [["DB Incline Press (heavy)","Machine Incline (pause)","Barbell Incline (heavy)"]],
      [["DB Incline Press","Cable Incline Fly","DB Incline (slow)"]],
    ], p, b);
    const chestIso = pick([
      [["Pec Dec","Low-to-High Cable Fly","DB Fly"]],
      [["Pec Dec (slow ecc)","Cable Fly (2-sec peak)","DB Fly (pause)"]],
      [["Pec Dec (drop set)","Cable Fly (rest-pause)","Cable Fly (1.5-rep)"]],
      [["Pec Dec (triple drop)","Weighted Dip","Cable Crossover"]],
      [["Pec Dec","Low-to-High Cable Fly","High-to-Low Cable Fly"]],
    ], p, b);
    const ohp = pick([
      [["DB Shoulder Press","Arnold Press","Cable Shoulder Press"]],
      [["DB Shoulder Press","Arnold Press","DB Press (slow ecc)"]],
      [["DB Press (rest-pause)","Arnold Press (pause)","DB Press (1.5-rep)"]],
      [["Barbell OHP (heavy)","DB Press (heavy)","Z-Press"]],
      [["DB Shoulder Press","Arnold Press","Machine Shoulder Press"]],
    ], p, b);
    const lateral = pick([
      [["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"]],
      [["Cable Lateral Raise","Lean-Away Cable Lateral","DB Lateral (drop set)"]],
      [["Lateral (rest-pause)","Lateral (2-sec hold)","Cable Lateral (cross-body)"]],
      [["Cable Lateral (heavy)","Lateral (triple drop)","Lateral (1.5-rep)"]],
      [["Cable Lateral Raise","DB Lateral Raise","Machine Lateral"]],
    ], p, b);
    const tri1 = pick([
      [["Tricep Pushdown (rope)","EZ-Bar Skull Crusher","Close-Grip Bench Press"]],
      [["Skull Crusher (2-sec ecc)","Overhead Cable Ext.","Pushdown (slow)"]],
      [["Pushdown (drop set)","Skull Crusher (drop)","Overhead (rest-pause)"]],
      [["Weighted Dip","JM Press","Skull Crusher (heavy)"]],
      [["Tricep Pushdown (rope)","Skull Crusher","Overhead Ext."]],
    ], p, b);
    const tri2 = pick([
      [["Overhead DB Ext. (single)","Cable Overhead Ext.","Tate Press"]],
      [["Overhead Cable Ext. (slow)","Tate Press (pause)","DB Overhead (2-sec)"]],
      [["Overhead Ext. (rest-pause)","Tate Press (drop)","Cable OH (1.5-rep)"]],
      [["JM Press","DB Overhead (heavy)","Cable Overhead (heavy)"]],
      [["Overhead DB Ext.","Cable Overhead Ext.","Tate Press"]],
    ], p, b);

    return {
      name: "Push A — Chest Focus", session: "A",
      warmup: "Band pull-aparts ×20 + rotator cuff circuit + push-up warm-up ×15 + shoulder CARs",
      note: "PUSH A emphasis: chest volume. Hit bench hard while fresh. Shoulders secondary.",
      exercises: [
        ex(chestComp, sr.sets, sr.comp, adv),
        ex(chestInc,  sr.sets, sr.comp, adv),
        ex(chestIso,  "4",     sr.iso,  p >= 3 ? t : "Peak contraction focus"),
        ex(ohp,       sr.sets, sr.comp, adv),
        ex(lateral,   "4",     sr.iso,  p >= 3 ? t : ""),
        ex(tri1,      "3-4",   sr.iso,  ""),
        ex(tri2,      "3",     sr.iso,  p >= 3 ? t : ""),
      ]
    };
  }

  // ── SESSION B: PULL A — Back Width + Biceps ───────────────────────────────
  if (session === "B") {
    const pullComp = pick([
      [["Weighted Pull-Up","Lat Pulldown (wide)","Weighted Chin-Up"]],
      [["Weighted Pull-Up","Lat Pulldown (neutral)","Weighted Chin-Up"]],
      [["Pull-Up (rest-pause)","Lat Pulldown (drop set)","Chin-Up (1.5-rep)"]],
      [["Weighted Pull-Up (heavy)","Lat Pulldown (heavy)","Chin-Up (heavy)"]],
      [["Weighted Pull-Up","Lat Pulldown","Chin-Up"]],
    ], p, b);
    const rowComp = pick([
      [["Barbell Row","Chest-Supported Row","Meadows Row"]],
      [["Barbell Row (2-sec squeeze)","Chest-Supported Row (slow)","Pendlay Row"]],
      [["Barbell Row (rest-pause)","CS Row (drop set)","Kroc Row"]],
      [["Barbell Row (heavy)","Seal Row","Meadows Row (heavy)"]],
      [["Barbell Row","Chest-Supported Row","Meadows Row"]],
    ], p, b);
    const pullIso = pick([
      [["Cable Straight-Arm Pulldown","Single-Arm LPD","Cable Pullover"]],
      [["Cable Straight-Arm PD (slow)","Single-Arm LPD (slow)","Cable Pullover (2-sec)"]],
      [["Straight-Arm PD (drop set)","Cable Pullover (rest-pause)","Single-Arm PD (1.5-rep)"]],
      [["Cable Straight-Arm PD (heavy)","Cable Pullover (heavy)","Single-Arm LPD (heavy)"]],
      [["Cable Straight-Arm Pulldown","Cable Pullover","Single-Arm LPD"]],
    ], p, b);
    const rearDelt = pick([
      [["Cable Face Pull (rope)","Rear Delt DB Fly","Cable Reverse Fly"]],
      [["Cable Face Pull","Rear Delt DB Fly (slow)","Cable RD (2-sec hold)"]],
      [["Face Pull (rest-pause)","Rear Delt (drop set)","Cable RD (1.5-rep)"]],
      [["Cable Face Pull (heavy)","Rear Delt (triple drop)","Prone RD (weighted)"]],
      [["Cable Face Pull","Rear Delt DB Fly","Cable Reverse Fly"]],
    ], p, b);
    const curl1 = pick([
      [["Barbell Curl","EZ-Bar Curl","DB Curl"]],
      [["Barbell Curl (2-sec ecc)","Incline DB Curl","EZ Curl (slow)"]],
      [["Barbell Curl (rest-pause)","Curl (drop set)","DB Curl (1.5-rep)"]],
      [["Barbell Curl (heavy)","EZ Curl (heavy)","DB Curl (heavy)"]],
      [["Barbell Curl","EZ-Bar Curl","Incline DB Curl"]],
    ], p, b);
    const curl2 = pick([
      [["Preacher Curl (EZ)","Concentration Curl","Cable Curl"]],
      [["Preacher Curl (slow)","Bayesian Cable Curl","Concentration (2-sec)"]],
      [["Preacher (rest-pause)","Bayesian (drop set)","Preacher (1.5-rep)"]],
      [["Preacher (heavy)","Cable Curl (heavy)","Bayesian (triple)"]],
      [["Preacher Curl","Bayesian Cable Curl","Concentration Curl"]],
    ], p, b);

    return {
      name: "Pull A — Back Width & Biceps", session: "B",
      warmup: "Band pull-aparts ×20 + face pulls ×15 + dead hangs ×30s + shoulder external rotation ×15",
      note: "PULL A emphasis: lat width via vertical pulls. Hit pull-ups first — back before biceps.",
      exercises: [
        ex(pullComp, sr.sets, sr.comp, adv),
        ex(rowComp,  sr.sets, sr.comp, adv),
        ex(pullIso,  "3-4",   sr.iso,  "Lat stretch at bottom, squeeze at top"),
        ex(rearDelt, "4",     "15-20", p >= 3 ? t : "Scapular retraction focus"),
        ex("Band Pull-Apart", "3", "20-25", "Every pull session — shoulder health"),
        ex(curl1,    "4",     sr.arm,  adv),
        ex(curl2,    "3",     sr.arm,  p >= 3 ? t : ""),
      ]
    };
  }

  // ── SESSION C: LEGS — Quad + Ham + Glute + Calf ───────────────────────────
  if (session === "C") {
    const squat = pick([
      [["Barbell Back Squat","Barbell Front Squat","High-Bar Squat"]],
      [["Barbell Back Squat","Barbell Back Squat (2-sec)","Front Squat"]],
      [["Squat (rest-pause)","Pause Squat (heavy)","Front Squat (heavy)"]],
      [["Barbell Back Squat (heavy)","Low-Bar Squat","Front Squat (heavy)"]],
      [["Barbell Back Squat","Pause Squat","Front Squat"]],
    ], p, b);
    const legPress = pick([
      [["Leg Press (high foot)","Leg Press (wide)","Hack Squat Machine"]],
      [["Leg Press (slow ecc)","Hack Squat","Single-Leg Press"]],
      [["Leg Press (drop set)","Hack Squat (pause)","Leg Press (rest-pause)"]],
      [["Leg Press (heavy)","Hack Squat (heavy)","Single-Leg Press (heavy)"]],
      [["Leg Press","Hack Squat","Single-Leg Press"]],
    ], p, b);
    const lunge = pick([
      [["Bulgarian Split Squat (DB)","Reverse Lunge (BB)","Step-Up (DB)"]],
      [["Bulgarian Split Squat (pause)","Deficit Reverse Lunge","Step-Up (heavy)"]],
      [["BSS (1.5-rep)","Lunge (drop set)","Deficit Lunge (slow)"]],
      [["BSS (heavy)","Walking Lunge (BB)","Split Squat (heavy)"]],
      [["Bulgarian Split Squat","Reverse Lunge","Step-Up"]],
    ], p, b);
    const rdl = pick([
      [["Romanian Deadlift (BB)","DB RDL","Trap Bar Deadlift"]],
      [["BB RDL (3-sec ecc)","Single-Leg RDL","BB RDL (pause)"]],
      [["BB RDL (rest-pause)","BB RDL (drop set)","Single-Leg RDL (slow)"]],
      [["Conventional Deadlift","BB RDL (heavy)","Trap Bar DL (heavy)"]],
      [["Romanian Deadlift (BB)","Single-Leg RDL","DB RDL"]],
    ], p, b);
    const legCurl = pick([
      [["Leg Curl (lying)","Single-Leg Curl","Nordic Eccentric"]],
      [["Leg Curl (3-sec ecc)","Nordic Eccentric","Single-Leg Curl (slow)"]],
      [["Leg Curl (drop set)","Leg Curl (rest-pause)","Leg Curl (1.5-rep)"]],
      [["Leg Curl (heavy)","Nordic Curl","GHR"]],
      [["Leg Curl","Single-Leg Curl","Nordic Eccentric"]],
    ], p, b);
    const hipThrust = pick([
      [["Barbell Hip Thrust","BB Hip Thrust (pause)","Hip Thrust (band+BB)"]],
      [["BB Hip Thrust (3-sec ecc)","Hip Thrust (slow+pause)","Single-Leg Hip Thrust"]],
      [["Hip Thrust (rest-pause)","Hip Thrust (drop set)","Hip Thrust (1.5-rep)"]],
      [["BB Hip Thrust (heavy)","Single-Leg Hip Thrust (heavy)","Hip Thrust (pause heavy)"]],
      [["Barbell Hip Thrust","BB Hip Thrust (pause)","Single-Leg Hip Thrust"]],
    ], p, b);
    const legExt = pick([
      [["Leg Extension","Leg Extension (slow ecc)","Leg Extension (1.5-rep)"]],
      [["Leg Extension (2-sec ecc)","Leg Extension (unilateral)","Leg Extension (pause top)"]],
      [["Leg Extension (drop set)","Leg Extension (rest-pause)","Leg Extension (mech drop)"]],
      [["Leg Extension (heavy)","Leg Extension (triple drop)","Leg Extension (21s)"]],
      [["Leg Extension","Leg Extension (slow)","Leg Extension (unilateral)"]],
    ], p, b);

    return {
      name: "Legs — Quad / Ham / Glute / Calf", session: "C",
      warmup: "10 min bike + hip flexor stretch ×60s + banded glute bridges ×20 + clamshells ×20 + leg swing ×10",
      note: "LEGS: Squat heavy first while fresh. Hinge second. Hip thrust + curl finishers. High effort throughout.",
      exercises: [
        ex(squat,    sr.sets, sr.comp, adv),
        ex(legPress, sr.sets, sr.comp, adv),
        ex(lunge,    "4",     sr.comp, ""),
        ex(rdl,      sr.sets, sr.comp, adv),
        ex(legCurl,  sr.sets, sr.iso,  adv),
        ex(hipThrust,"4",     sr.iso,  p >= 3 ? t : "Squeeze hard at top"),
        ex(legExt,   "4",     sr.iso,  p >= 3 ? t : ""),
        ex("Seated Calf Raise", "4", "12-15", "Full ROM — 3-sec eccentric, pause at stretch"),
        ex("Standing Calf Raise", "3", "15-20", "Single-leg if possible"),
      ]
    };
  }

  // ── SESSION D: PUSH B — Shoulder Focus + Chest + Triceps ─────────────────
  if (session === "D") {
    const ohpComp = pick([
      [["Barbell OHP","DB Shoulder Press","Landmine Press"]],
      [["Barbell OHP (slow ecc)","Arnold Press","Cable Shoulder Press"]],
      [["Barbell OHP (rest-pause)","DB Press (drop set)","Arnold Press (pause)"]],
      [["Barbell OHP (heavy)","DB Press (heavy)","Push Press (heavy)"]],
      [["Barbell OHP","DB Shoulder Press","Machine Shoulder Press"]],
    ], p, b);
    const lateral2 = pick([
      [["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"]],
      [["Lean-Away Cable Lateral","DB Lateral (drop set)","Cable Lateral (cross-body)"]],
      [["Lateral (rest-pause)","Lateral (2-sec hold)","Lateral (cheat + control)"]],
      [["Cable Lateral (heavy)","Lateral (triple drop)","Lateral (1.5-rep)"]],
      [["DB Lateral Raise","Cable Lateral Raise","Machine Lateral"]],
    ], p, b);
    const frontDelt = pick([
      [["DB Front Raise","Cable Front Raise","Plate Front Raise"]],
      [["DB Front Raise (slow)","Cable Front (2-sec pause)","Plate Raise (slow)"]],
      [["Front Raise (rest-pause)","Front Raise (drop)","Cable Front (1.5-rep)"]],
      [["DB Front Raise (heavy)","Cable Front Raise (heavy)","Plate Raise (heavy)"]],
      [["DB Front Raise","Cable Front Raise","Plate Front Raise"]],
    ], p, b);
    const chestComp2 = pick([
      [["DB Bench Press","Low-to-High Cable Fly","Pec Dec"]],
      [["DB Bench (2-sec ecc)","Pec Dec (slow)","Cable Fly (pause)"]],
      [["DB Bench (drop set)","Pec Dec (rest-pause)","Cable Fly (1.5-rep)"]],
      [["DB Bench (heavy)","Close-Grip Bench","Cable Crossover (heavy)"]],
      [["DB Bench Press","Pec Dec","Low-to-High Cable Fly"]],
    ], p, b);
    const rearDelt2 = pick([
      [["Rear Delt DB Fly","Cable Reverse Fly","Prone Rear Delt Fly"]],
      [["Rear Delt (slow 2-sec)","Cable RD (pause peak)","Prone RD (weighted)"]],
      [["Rear Delt (drop set)","Cable RD (rest-pause)","Rear Delt (1.5-rep)"]],
      [["Rear Delt (heavy)","Cable RD (triple drop)","Prone RD (heavy)"]],
      [["Rear Delt DB Fly","Cable Reverse Fly","Rear Delt Machine"]],
    ], p, b);
    const tri3 = pick([
      [["EZ-Bar Skull Crusher","Close-Grip Bench","Overhead Cable Ext."]],
      [["Skull Crusher (2-sec ecc)","CG Bench (pause)","Cable OH (slow)"]],
      [["Skull Crusher (drop set)","CG Bench (rest-pause)","Cable OH (1.5-rep)"]],
      [["Skull Crusher (heavy)","Weighted Dip","JM Press"]],
      [["EZ-Bar Skull Crusher","Close-Grip Bench","Overhead Cable Ext."]],
    ], p, b);

    return {
      name: "Push B — Shoulder Focus", session: "D",
      warmup: "Band pull-aparts ×20 + rotator cuff ×15ea + lateral raise warm-up 2×15 + face pulls ×15",
      note: "PUSH B emphasis: shoulder volume. OHP first while fresh. Chest secondary. More rear delt work here.",
      exercises: [
        ex(ohpComp,   sr.sets, sr.comp, adv),
        ex(lateral2,  "4",     sr.iso,  p >= 3 ? t : ""),
        ex(frontDelt, "3",     "12-15", "Controlled — no swinging"),
        ex(chestComp2,"4",     sr.comp, adv),
        ex(rearDelt2, "4",     "15-20", p >= 3 ? t : "Scaps back and down"),
        ex("Cable Face Pull (rope)", "4", "15-20", "Every push session — shoulder health"),
        ex(tri3,      "3-4",   sr.iso,  p >= 3 ? t : ""),
      ]
    };
  }

  // ── SESSION E: PULL B — Back Thickness + Arm Specialization ──────────────
  if (session === "E") {
    const rowComp2 = pick([
      [["Single-Arm DB Row","Chest-Supported Row","Meadows Row"]],
      [["Single-Arm DB Row (slow)","Helms Row","DB Seal Row"]],
      [["SA Row (rest-pause)","Gorilla Row","Inverted Row (weighted)"]],
      [["Meadows Row (heavy)","SA DB Row (heavy)","CS Row (slow)"]],
      [["Single-Arm DB Row","Chest-Supported Row","Helms Row"]],
    ], p, b);
    const rowComp3 = pick([
      [["Cable Row (wide)","Cable Row (close)","Cable Row (high pulley)"]],
      [["Cable Row (2-sec squeeze)","Seated Row (underhand)","Cable Row (slow)"]],
      [["Cable Row (rest-pause)","Cable Row (drop set)","Seated Row (1.5-rep)"]],
      [["Cable Row (heavy)","Pendlay Row","Seal Row (heavy)"]],
      [["Seated Cable Row","Cable Row (high pulley)","Chest-Supported Row"]],
    ], p, b);
    const pullIso2 = pick([
      [["Lat Pulldown (neutral)","Single-Arm Pulldown","Cable Pullover"]],
      [["LPD (underhand slow)","Single-Arm PD (slow)","Cable Pullover (2-sec)"]],
      [["LPD (drop set)","Straight-Arm PD","Cable Pullover (rest-pause)"]],
      [["LPD (heavy)","Weighted Pull-Up","Cable Pullover (heavy)"]],
      [["Lat Pulldown","Single-Arm Pulldown","Cable Pullover"]],
    ], p, b);
    // ARM SPECIALIZATION — bigger volume here than Pull A
    const curlSpec1 = pick([
      [["Incline DB Curl","Preacher Curl (EZ)","Cable Curl (standing)"]],
      [["Incline DB Curl (slow)","Preacher Curl (slow)","Bayesian Cable Curl"]],
      [["Incline Curl (rest-pause)","Preacher (drop set)","Bayesian (1.5-rep)"]],
      [["Incline Curl (heavy)","Preacher (heavy)","Barbell Drag Curl"]],
      [["Incline DB Curl","Preacher Curl","Bayesian Cable Curl"]],
    ], p, b);
    const curlSpec2 = pick([
      [["Hammer Curl","Cross-Body Hammer Curl","Rope Hammer Curl"]],
      [["Hammer Curl (slow)","Cross-Body (2-sec)","Rope Hammer (slow)"]],
      [["Hammer (rest-pause)","Cross-Body (drop)","Rope Hammer (1.5-rep)"]],
      [["Hammer Curl (heavy)","Cross-Body (heavy)","DB Reverse Curl"]],
      [["Hammer Curl","Cross-Body Hammer","Rope Hammer Curl"]],
    ], p, b);
    const curlSpec3 = pick([
      [["Concentration Curl","Spider Curl","Machine Curl"]],
      [["Concentration (slow peak)","Spider Curl (slow)","Machine Curl (pause)"]],
      [["Concentration (drop set)","Spider (rest-pause)","Machine (1.5-rep)"]],
      [["Concentration (heavy)","Spider Curl (heavy)","Machine Curl (heavy)"]],
      [["Concentration Curl","Spider Curl","Machine Curl"]],
    ], p, b);
    const triBurn = pick([
      [["Tricep Pushdown (rope)","Pushdown (bar)","Single-Arm Pushdown"]],
      [["Pushdown (slow)","Pushdown (2-sec ecc)","Overhead Ext. (slow)"]],
      [["Pushdown (drop set)","Pushdown (rest-pause)","Single-Arm (1.5-rep)"]],
      [["Pushdown (heavy)","Overhead Ext. (heavy)","Single-Arm (heavy)"]],
      [["Tricep Pushdown","Single-Arm Pushdown","Overhead Ext."]],
    ], p, b);

    return {
      name: "Pull B — Thickness & Arm Specialization", session: "E",
      warmup: "Face pulls ×20 + band pull-aparts ×20 + dead hangs ×30s + bicep stretch ×30s",
      note: "PULL B emphasis: back THICKNESS via horizontal rows. Then full arm specialization — 3 curl + 1 tri.",
      exercises: [
        ex(rowComp2,  sr.sets, sr.comp, adv),
        ex(rowComp3,  sr.sets, sr.comp, adv),
        ex(pullIso2,  "3-4",   sr.iso,  "Lat focus — full stretch and squeeze"),
        ex(curlSpec1, "4",     sr.arm,  adv),
        ex(curlSpec2, "3-4",   sr.arm,  p >= 3 ? t : ""),
        ex(curlSpec3, "3",     sr.arm,  p >= 3 ? t : "Peak contraction — squeeze hard"),
        ex(triBurn,   "3",     sr.iso,  "Tricep pump finisher"),
      ]
    };
  }

  return null;
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const LS = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentWeek, setCurrentWeek] = useState(() => parseInt(LS.get("h365v2_week") || "1"));
  const [weights, setWeights] = useState(() => LS.get("h365v2_weights") || {});
  const [completed, setCompleted] = useState(() => LS.get("h365v2_completed") || {});
  const [activeDay, setActiveDay] = useState(null);
  const [view, setView] = useState("schedule");

  const saveWeek = (w) => { setCurrentWeek(w); LS.set("h365v2_week", w); };
  const saveWeights = useCallback((w) => { setWeights(w); LS.set("h365v2_weights", w); }, []);
  const saveCompleted = useCallback((c) => { setCompleted(c); LS.set("h365v2_completed", c); }, []);

  const phaseNum = getPhaseNum(currentWeek);
  const phase = PHASES[phaseNum - 1];
  const deload = isDeload(currentWeek);

  const weekDays = [
    { label:"MON", dow:1 }, { label:"TUE", dow:2 }, { label:"WED", dow:3 },
    { label:"THU", dow:4 }, { label:"FRI", dow:5 }, { label:"SAT", dow:6 }, { label:"SUN", dow:0 },
  ];

  if (view === "workout" && activeDay) {
    return <WorkoutView weekNum={activeDay.weekNum} session={activeDay.session}
      weights={weights} onSaveWeights={saveWeights}
      onComplete={(key) => saveCompleted({ ...completed, [key]: true })}
      completed={completed} onBack={() => setView("schedule")}
      deload={isDeload(activeDay.weekNum)} />;
  }
  if (view === "progress") {
    return <ProgressView weights={weights} completed={completed}
      onBack={() => setView("schedule")} currentWeek={currentWeek} />;
  }

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <div style={S.logo}>HYPERTROPHY<span style={{ color: phase.color }}>365</span></div>
            <div style={S.sublogo}>V2 · 5-Day PPL · Max Size · Low-Back Safe</div>
          </div>
          <button onClick={() => setView("progress")} style={S.progressBtn}>📈 Progress</button>
        </div>
      </div>

      {/* Phase Banner */}
      <div style={{ ...S.phaseBanner, borderColor: phase.color }}>
        <div style={S.phaseBannerRow}>
          <div>
            <div style={{ ...S.phaseLabel, color: phase.color }}>PHASE {phaseNum} · WEEK {currentWeek} OF 52</div>
            <div style={S.phaseName}>{phase.name}</div>
            <div style={S.phaseFocus}>{phase.focus}</div>
          </div>
          {deload && <div style={S.deloadBadge}>🔄 DELOAD</div>}
        </div>
      </div>

      {/* Split explainer */}
      <div style={S.splitRow}>
        {[
          { s:"A", label:"Push A", sub:"Chest+Shldr+Tri" },
          { s:"B", label:"Pull A", sub:"Back+Bi+RD" },
          { s:"C", label:"Legs",   sub:"Full Lower" },
          { s:"D", label:"Push B", sub:"Shldr+Chest+Tri" },
          { s:"E", label:"Pull B", sub:"Rows+Arms" },
        ].map(({ s, label, sub }) => (
          <div key={s} style={S.splitCard}>
            <div style={{ ...S.splitLetter, color: SESSION_COLORS[s], background: SESSION_COLORS[s] + "15" }}>{s}</div>
            <div style={{ ...S.splitLabel, color: SESSION_COLORS[s] }}>{label}</div>
            <div style={S.splitSub}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Week Nav */}
      <div style={S.weekNav}>
        <button onClick={() => saveWeek(Math.max(1, currentWeek-1))} style={{ ...S.navBtn, borderColor: phase.color+"44" }} disabled={currentWeek===1}>‹</button>
        <div style={S.weekCenter}>
          <div style={S.weekBig}>Week {currentWeek}</div>
          <div style={S.weekSub}>of 52</div>
        </div>
        <button onClick={() => saveWeek(Math.min(52, currentWeek+1))} style={{ ...S.navBtn, borderColor: phase.color+"44" }} disabled={currentWeek===52}>›</button>
      </div>

      {/* Day Grid */}
      <div style={S.dayGrid}>
        {weekDays.map(({ label, dow }) => {
          const session = SESSION_MAP[dow];
          const isTraining = !!session;
          const key = `w${currentWeek}_${session}`;
          const done = completed[key];
          const color = session ? SESSION_COLORS[session] : "#333";
          return (
            <div key={dow}
              onClick={() => { if (isTraining) { setActiveDay({ weekNum: currentWeek, session }); setView("workout"); } }}
              style={{ ...S.dayCard,
                borderColor: done ? color : isTraining ? color+"44" : "#1a1a1f",
                background: done ? color+"15" : isTraining ? "#111" : "#0a0a0a",
                cursor: isTraining ? "pointer" : "default",
                opacity: isTraining ? 1 : 0.35,
              }}>
              <div style={S.dayLabel}>{label}</div>
              {isTraining ? (<>
                <div style={{ ...S.sessionBadge, color, background: color+"18" }}>{session}</div>
                <div style={{ fontSize: 8, color: done ? color : "#555", lineHeight:1.3, textAlign:"center" }}>
                  {SESSION_LABELS[session].split("·")[0].trim()}
                </div>
                {done && <div style={{ color, fontSize:14, fontWeight:700 }}>✓</div>}
              </>) : <div style={{ fontSize:8, color:"#1e1e1e", letterSpacing:1 }}>REST</div>}
            </div>
          );
        })}
      </div>

      {/* Phase Progress Bar */}
      <div style={S.phaseBar}>
        <div style={S.phaseBarLabel}>PHASE PROGRESS — TAP TO JUMP</div>
        <div style={S.phaseTrack}>
          {PHASES.map((ph, i) => {
            const wks = ph.weeks[1] - ph.weeks[0] + 1;
            const pct = (wks / 52) * 100;
            const active = phaseNum === i + 1;
            const past = currentWeek > ph.weeks[1];
            return (
              <div key={i} onClick={() => saveWeek(ph.weeks[0])}
                title={`Phase ${i+1}: ${ph.name} (Wk ${ph.weeks[0]}-${ph.weeks[1]})`}
                style={{ width:`${pct}%`, height:"100%", background: past ? ph.color : active ? ph.color+"66" : "#111",
                  cursor:"pointer", position:"relative", transition:"all 0.3s" }}>
                {active && <div style={{ position:"absolute", inset:-2, border:`2px solid ${ph.color}`, borderRadius:2 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          {PHASES.map((ph, i) => (
            <div key={i} onClick={() => saveWeek(ph.weeks[0])}
              style={{ fontSize:9, cursor:"pointer", color: phaseNum===i+1 ? ph.color : "#2a2a2f", fontWeight: phaseNum===i+1 ? 700 : 400 }}>
              P{i+1}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { label:"Sessions Done", val: Object.keys(completed).length, color: phase.color },
          { label:"Sets Logged",   val: Object.values(weights).reduce((a,b) => a+(Array.isArray(b?.sets) ? b.sets.filter(s=>s?.weight).length : 0), 0), color: "#FF9A3C" },
          { label:"Weeks Logged",  val: [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length, color: "#4FACFE" },
        ].map(({ label, val, color }) => (
          <div key={label} style={S.statCard}>
            <div style={{ ...S.statVal, color }}>{val}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WORKOUT VIEW ─────────────────────────────────────────────────────────────
function WorkoutView({ weekNum, session, weights, onSaveWeights, onComplete, completed, onBack, deload }) {
  const workout = getWorkout(session, weekNum);
  const phaseNum = getPhaseNum(weekNum);
  const phase = PHASES[phaseNum - 1];
  const key = `w${weekNum}_${session}`;
  const isDone = completed[key];
  const color = SESSION_COLORS[session];
  const [note, setNote] = useState(() => {
    try { return localStorage.getItem(`h365v2_note_${key}`) || ""; } catch { return ""; }
  });

  const saveNote = (v) => { setNote(v); try { localStorage.setItem(`h365v2_note_${key}`, v); } catch {} };
  const getKey = (i) => `w${weekNum}_${session}_${i}`;
  const updateSet = (ei, si, field, value) => {
    const k = getKey(ei);
    const prev = weights[k] || { sets: Array(8).fill(null).map(() => ({ weight:"", reps:"" })) };
    const sets = [...prev.sets];
    sets[si] = { ...sets[si], [field]: value };
    onSaveWeights({ ...weights, [k]: { ...prev, sets } });
  };
  const getSD = (ei, si) => weights[getKey(ei)]?.sets?.[si] || { weight:"", reps:"" };
  const nSets = (s) => { const m = s.match(/(\d+)/); return m ? parseInt(m[1]) : 3; };
  const isBW = (n) => ["Band Pull-Apart","Cable Face Pull","Face Pull"].some(k => n.includes(k));

  if (!workout) return null;

  return (
    <div style={S.app}>
      <div style={{ ...S.workoutHeader, borderBottomColor: color }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:9, letterSpacing:3, color, fontWeight:700 }}>WEEK {weekNum} · SESSION {session}</div>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{workout.name}</div>
          <div style={{ fontSize:10, color:"#444", marginTop:2 }}>Phase {phaseNum}: {phase.name}</div>
        </div>
        {!isDone
          ? <button onClick={() => onComplete(key)} style={{ ...S.completeBtn, background: color }}>Done ✓</button>
          : <div style={{ color, fontSize:13, fontWeight:700, whiteSpace:"nowrap" }}>✓ Done</div>
        }
      </div>

      {deload && <div style={S.deloadAlert}>🔄 DELOAD — Use 60-70% load. Same reps. Full ROM. Connective tissue recovery.</div>}

      {/* Session emphasis note */}
      <div style={{ ...S.emphasisBar, borderColor: color+"44", color }}>
        <span style={{ fontSize:9, letterSpacing:2, fontWeight:700 }}>EMPHASIS  </span>
        <span style={{ fontSize:11, color:"#888" }}>{workout.note}</span>
      </div>

      <div style={S.warmupBar}>
        <span style={S.warmupLabel}>WARM-UP</span>
        <span style={S.warmupText}>{workout.warmup}</span>
      </div>

      <div style={S.exList}>
        {workout.exercises.map((ex, ei) => (
          <div key={ei} style={{ ...S.exCard, borderColor: isBW(ex.exercise) ? "#111" : "#1a1a1f" }}>
            <div style={S.exHeader}>
              <div style={{ ...S.exNum, background: color+"20", color }}>{ei + 1}</div>
              <div style={{ flex:1 }}>
                <div style={S.exName}>{ex.exercise}</div>
                <div style={S.exMeta}>
                  <span style={{ ...S.pill, borderColor: color+"44" }}>{ex.sets} sets</span>
                  <span style={{ ...S.pill, borderColor: color+"44" }}>{ex.reps} reps</span>
                  {ex.notes && <span style={S.techPill}>{ex.notes}</span>}
                </div>
              </div>
            </div>
            {!isBW(ex.exercise) ? (
              <div style={S.setsGrid}>
                <div style={S.setsHead}>
                  <span style={S.setHdr}>SET</span>
                  <span style={S.setHdr}>WEIGHT (lbs)</span>
                  <span style={S.setHdr}>REPS DONE</span>
                </div>
                {Array.from({ length: nSets(ex.sets) }).map((_, si) => {
                  const sd = getSD(ei, si);
                  return (
                    <div key={si} style={S.setRow}>
                      <span style={{ ...S.setNum, color }}>{si + 1}</span>
                      <input type="number" placeholder="lbs" value={sd.weight}
                        onChange={e => updateSet(ei, si, "weight", e.target.value)}
                        style={S.wInput} inputMode="decimal" />
                      <input type="number" placeholder={ex.reps} value={sd.reps}
                        onChange={e => updateSet(ei, si, "reps", e.target.value)}
                        style={S.rInput} inputMode="decimal" />
                    </div>
                  );
                })}
              </div>
            ) : <div style={S.bwNote}>Bodyweight / Band — log reps in notes if needed</div>}
          </div>
        ))}
      </div>

      <div style={S.noteBox}>
        <div style={S.noteLabel}>SESSION NOTES</div>
        <textarea placeholder="Energy, PRs, pain, what moved well..." value={note}
          onChange={e => saveNote(e.target.value)} style={S.noteInput} />
      </div>
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────────────
function ProgressView({ weights, completed, onBack, currentWeek }) {
  const totalSessions = Object.keys(completed).length;
  const totalSets = Object.values(weights).reduce((a,b) => a+(Array.isArray(b?.sets) ? b.sets.filter(s=>s?.weight).length : 0), 0);
  const weeksLogged = [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length;
  const topPhase = PHASES[getPhaseNum(currentWeek)-1];

  const prs = {};
  Object.entries(weights).forEach(([key, data]) => {
    const parts = key.split("_");
    if (parts.length < 3) return;
    const wk = parseInt(parts[0].replace("w",""));
    const sess = parts[1];
    const ei = parseInt(parts[2]);
    try {
      const wo = getWorkout(sess, wk);
      const e = wo?.exercises?.[ei];
      if (!e) return;
      data.sets?.forEach(s => {
        if (!s?.weight) return;
        const w = parseFloat(s.weight);
        if (!prs[e.exercise] || w > prs[e.exercise]) prs[e.exercise] = w;
      });
    } catch {}
  });
  const prList = Object.entries(prs).sort((a,b) => b[1]-a[1]).slice(0, 12);

  return (
    <div style={S.app}>
      <div style={{ ...S.workoutHeader, borderBottomColor: topPhase.color }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:9, letterSpacing:3, color: topPhase.color, fontWeight:700 }}>YOUR PROGRESS</div>
          <div style={{ fontSize:17, fontWeight:700, color:"#fff" }}>Stats & PRs</div>
        </div>
        <div style={{ width:50 }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"16px 12px 8px" }}>
        {[
          { label:"Sessions",    val:totalSessions, color:"#00C9A7" },
          { label:"Sets Logged", val:totalSets,     color:"#FF9A3C" },
          { label:"Weeks Done",  val:weeksLogged,   color:"#4FACFE" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background:"#0f0f12", border:"1px solid #1a1a1f", borderRadius:12, padding:"14px 8px", textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:9, color:"#444", letterSpacing:1, marginTop:3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Split volume breakdown */}
      <div style={{ padding:"8px 16px 4px", fontSize:9, color:"#333", letterSpacing:2 }}>SESSIONS BY TYPE</div>
      <div style={{ padding:"0 12px 16px", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
        {["A","B","C","D","E"].map(s => {
          const count = Object.keys(completed).filter(k => k.includes(`_${s}`)).length;
          const color = SESSION_COLORS[s];
          return (
            <div key={s} style={{ background:"#0f0f12", border:`1px solid ${color}22`, borderRadius:10, padding:"10px 6px", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color }}>{count}</div>
              <div style={{ fontSize:9, color, letterSpacing:1, marginTop:2 }}>{s}</div>
              <div style={{ fontSize:8, color:"#333", marginTop:1 }}>{SESSION_LABELS[s].split("·")[0].trim()}</div>
            </div>
          );
        })}
      </div>

      <div style={{ padding:"0 16px 8px", fontSize:9, color:"#333", letterSpacing:2 }}>TOP WEIGHTS LOGGED</div>
      {prList.length === 0
        ? <div style={{ textAlign:"center", color:"#2a2a2f", padding:"30px 0", fontSize:13 }}>No weights logged yet — start a session!</div>
        : <div style={{ padding:"0 12px", display:"flex", flexDirection:"column", gap:6 }}>
            {prList.map(([name, w], i) => {
              const colors = ["#FF6B6B","#4FACFE","#00C9A7","#F7971E","#C471ED"];
              const c = colors[i % colors.length];
              return (
                <div key={name} style={{ display:"flex", alignItems:"center", gap:12, background:"#0f0f12", border:`1px solid ${c}22`, borderRadius:10, padding:"10px 14px" }}>
                  <div style={{ fontSize:11, color:"#333", width:20, textAlign:"right" }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:13, color:"#ddd" }}>{name}</div>
                  <div style={{ fontSize:16, fontWeight:700, color: c }}>{w} <span style={{ color:"#333", fontSize:11 }}>lbs</span></div>
                </div>
              );
            })}
          </div>
      }

      <div style={{ padding:"16px 16px 8px", fontSize:9, color:"#333", letterSpacing:2 }}>PHASE COMPLETION</div>
      <div style={{ padding:"0 12px 40px", display:"flex", flexDirection:"column", gap:8 }}>
        {PHASES.map((ph, i) => {
          const sessInPhase = Object.keys(completed).filter(k => {
            const wk = parseInt(k.split("_")[0].replace("w",""));
            return wk >= ph.weeks[0] && wk <= ph.weeks[1];
          }).length;
          const maxSess = (ph.weeks[1] - ph.weeks[0] + 1) * 5;
          const pct = Math.min(100, Math.round((sessInPhase / maxSess) * 100));
          return (
            <div key={i} style={{ background:"#0f0f12", border:"1px solid #1a1a1f", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:9, color:"#2a2a2f", letterSpacing:2 }}>PHASE {i+1}</div>
                  <div style={{ fontSize:14, fontWeight:700, color: ph.color }}>{ph.name}</div>
                  <div style={{ fontSize:10, color:"#333", marginTop:2 }}>Wk {ph.weeks[0]}–{ph.weeks[1]}</div>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color: ph.color }}>{pct}%</div>
              </div>
              <div style={{ height:4, background:"#111", borderRadius:2 }}>
                <div style={{ width:`${pct}%`, height:"100%", background: ph.color, borderRadius:2, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:10, color:"#2a2a2f", marginTop:4 }}>{sessInPhase} / {maxSess} sessions completed</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { background:"#080809", minHeight:"100vh", color:"#e8e8e8", fontFamily:"'DM Mono','Fira Code','Courier New',monospace", maxWidth:520, margin:"0 auto", paddingBottom:60 },
  header: { padding:"18px 16px 14px", borderBottom:"1px solid #111" },
  headerRow: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  logo: { fontSize:20, fontWeight:700, letterSpacing:3, color:"#fff" },
  sublogo: { fontSize:9, color:"#2a2a2f", letterSpacing:2, marginTop:3 },
  progressBtn: { background:"#0f0f12", border:"1px solid #1a1a1f", color:"#555", padding:"8px 12px", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit" },
  phaseBanner: { margin:"12px 14px 8px", padding:"12px 16px", borderLeft:"3px solid", background:"#0c0c0e", borderRadius:"0 10px 10px 0" },
  phaseBannerRow: { display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  phaseLabel: { fontSize:9, letterSpacing:3, fontWeight:700, marginBottom:3 },
  phaseName: { fontSize:17, fontWeight:700, color:"#fff", marginBottom:3 },
  phaseFocus: { fontSize:10, color:"#444", lineHeight:1.5 },
  deloadBadge: { background:"#0f0800", border:"1px solid #F7971E44", color:"#F7971E", padding:"5px 12px", borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:1 },
  splitRow: { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:4, padding:"8px 10px" },
  splitCard: { background:"#0c0c0e", borderRadius:8, padding:"8px 4px", textAlign:"center" },
  splitLetter: { fontSize:15, fontWeight:700, borderRadius:4, padding:"2px 6px", margin:"0 auto 4px", width:"fit-content" },
  splitLabel: { fontSize:9, fontWeight:700, letterSpacing:1 },
  splitSub: { fontSize:8, color:"#2a2a2f", marginTop:2, lineHeight:1.3 },
  weekNav: { display:"flex", alignItems:"center", justifyContent:"center", gap:24, padding:"12px 20px" },
  navBtn: { background:"#0f0f12", border:"1px solid", color:"#fff", width:36, height:36, borderRadius:"50%", cursor:"pointer", fontSize:18, fontFamily:"inherit" },
  weekCenter: { textAlign:"center" },
  weekBig: { fontSize:22, fontWeight:700, color:"#fff" },
  weekSub: { fontSize:12, color:"#2a2a2f" },
  dayGrid: { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:5, padding:"0 10px 12px" },
  dayCard: { border:"1px solid", borderRadius:10, padding:"8px 4px", textAlign:"center", transition:"all 0.15s", minHeight:86, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3 },
  dayLabel: { fontSize:8, letterSpacing:1, color:"#2a2a2f", fontWeight:700 },
  sessionBadge: { fontSize:14, fontWeight:700, padding:"2px 7px", borderRadius:5, letterSpacing:1 },
  phaseBar: { padding:"0 14px 14px" },
  phaseBarLabel: { fontSize:9, color:"#2a2a2f", letterSpacing:2, marginBottom:7 },
  phaseTrack: { display:"flex", height:6, borderRadius:3, overflow:"hidden", gap:2 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, padding:"0 12px" },
  statCard: { background:"#0f0f12", border:"1px solid #1a1a1f", borderRadius:12, padding:"12px 8px", textAlign:"center" },
  statVal: { fontSize:24, fontWeight:700 },
  statLabel: { fontSize:9, color:"#333", letterSpacing:1, marginTop:2 },
  workoutHeader: { display:"flex", alignItems:"center", gap:10, padding:"14px", borderBottom:"1px solid", position:"sticky", top:0, background:"#080809", zIndex:10 },
  backBtn: { background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:14, padding:"6px 0", fontFamily:"inherit" },
  completeBtn: { border:"none", color:"#000", fontWeight:700, padding:"8px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit", whiteSpace:"nowrap" },
  deloadAlert: { background:"#0f0800", borderLeft:"3px solid #F7971E", color:"#F7971E", padding:"10px 16px", fontSize:12, lineHeight:1.6 },
  emphasisBar: { borderLeft:"2px solid", padding:"8px 16px", margin:"0", background:"#0a0a0b" },
  warmupBar: { background:"#0c0c0e", padding:"10px 16px", display:"flex", gap:10, alignItems:"flex-start" },
  warmupLabel: { fontSize:9, color:"#2a2a2f", letterSpacing:2, fontWeight:700, whiteSpace:"nowrap", paddingTop:1 },
  warmupText: { fontSize:11, color:"#555", lineHeight:1.6 },
  exList: { padding:"8px 12px", display:"flex", flexDirection:"column", gap:8 },
  exCard: { background:"#0c0c0e", border:"1px solid", borderRadius:10, overflow:"hidden" },
  exHeader: { display:"flex", gap:10, padding:"11px 12px 7px", alignItems:"flex-start" },
  exNum: { width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, marginTop:2 },
  exName: { fontSize:13, fontWeight:700, color:"#f0f0f0", marginBottom:5, lineHeight:1.3 },
  exMeta: { display:"flex", gap:5, flexWrap:"wrap" },
  pill: { border:"1px solid", borderRadius:4, padding:"2px 6px", fontSize:10, color:"#555" },
  techPill: { background:"#0f0a00", border:"1px solid #F7971E33", borderRadius:4, padding:"2px 6px", fontSize:10, color:"#F7971E" },
  setsGrid: { padding:"0 12px 10px" },
  setsHead: { display:"grid", gridTemplateColumns:"26px 1fr 1fr", gap:6, marginBottom:4 },
  setHdr: { fontSize:9, color:"#2a2a2f", letterSpacing:1 },
  setRow: { display:"grid", gridTemplateColumns:"26px 1fr 1fr", gap:6, marginBottom:5, alignItems:"center" },
  setNum: { fontSize:12, fontWeight:700, textAlign:"center" },
  wInput: { background:"#080809", border:"1px solid #1a1a1f", borderRadius:6, padding:"8px 6px", color:"#fff", fontSize:16, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center" },
  rInput: { background:"#080809", border:"1px solid #1a1a1f", borderRadius:6, padding:"8px 6px", color:"#666", fontSize:16, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center" },
  bwNote: { padding:"4px 12px 10px", fontSize:11, color:"#2a2a2f", fontStyle:"italic" },
  noteBox: { padding:"12px 16px" },
  noteLabel: { fontSize:9, color:"#2a2a2f", letterSpacing:2, marginBottom:7 },
  noteInput: { width:"100%", background:"#0c0c0e", border:"1px solid #1a1a1f", borderRadius:8, padding:12, color:"#666", fontSize:13, fontFamily:"inherit", resize:"vertical", minHeight:80, boxSizing:"border-box" },
};

import { useState, useCallback, useEffect, useRef } from "react";

// ─── HYPERTROPHY 365 V2 ───────────────────────────────────────────────────────
// 5-DAY PPL SPLIT — Low-Back Safe, No Spinal Compression
//
// BANNED: Barbell Back Squat, Front Squat, Good Morning, Barbell OHP (standing),
//         any loaded axial spinal compression movement
//
// SAFE alternatives used throughout:
// Squatting → Leg Press, Hack Squat, Bulgarian Split Squat, Goblet Squat
// Hinging   → DB/BB RDL (hinge not compression), Cable Pull-Through, Hip Thrust
// Pressing  → DB OHP (seated), Landmine Press, Machine Press (no spinal load)

const PHASES = [
  { name: "Volume Foundation",   weeks: [1,8],   focus: "4×10-12 | RPE 7-8 | 15-18 sets/muscle/wk | Build the base", color: "#22D3EE" },
  { name: "Hypertrophy Drive",   weeks: [9,20],  focus: "4-5×8-12 | RPE 8 | 20-22 sets/muscle/wk | Peak volume block", color: "#818CF8" },
  { name: "Intensification",     weeks: [21,30], focus: "4-5×6-10 | RPE 8-9 | Slow eccentrics + advanced techniques", color: "#FB923C" },
  { name: "Strength-Size",       weeks: [31,42], focus: "5×4-8 compound / 10-15 iso | RPE 9 | Heavy & hard", color: "#34D399" },
  { name: "Specialization Peak", weeks: [43,52], focus: "4×8-12 | Lagging muscles prioritized | Deload every 4th wk", color: "#F472B6" },
];

const SESSION_MAP    = { 1:"A", 2:"B", 3:"C", 4:"D", 5:"E", 6:null, 0:null };
const SESSION_COLORS = { A:"#F87171", B:"#60A5FA", C:"#34D399", D:"#FB923C", E:"#A78BFA" };
const SESSION_LABELS = {
  A: "Push A · Chest / Shoulders / Tris",
  B: "Pull A · Back / Biceps / Rear Delt",
  C: "Legs · Quad / Ham / Glute / Calf",
  D: "Push B · Shoulders / Chest / Tris",
  E: "Pull B · Back / Arms Specialization",
};

function getPhaseNum(w) {
  for (let i = 0; i < PHASES.length; i++)
    if (w >= PHASES[i].weeks[0] && w <= PHASES[i].weeks[1]) return i + 1;
  return 5;
}
function getBlock(w) { return Math.floor((w - 1) / 4) % 3; }
function isDeload(w) {
  if ([20,28,30,38,42].includes(w)) return true;
  if (w >= 43 && (w - 43) % 4 === 3) return true;
  return false;
}
function getSR(phase) {
  return [
    { sets:"4",   comp:"10-12", iso:"12-15", arm:"12-15" },
    { sets:"4-5", comp:"8-12",  iso:"10-12", arm:"10-12" },
    { sets:"4-5", comp:"6-10",  iso:"10-12", arm:"10-12" },
    { sets:"5",   comp:"4-8",   iso:"8-12",  arm:"10-12" },
    { sets:"4",   comp:"8-12",  iso:"10-15", arm:"12-15" },
  ][phase - 1] || { sets:"4", comp:"8-12", iso:"12-15", arm:"12-15" };
}
function getTech(phase, block) {
  if (phase < 3) return "";
  return [
    ["2-sec eccentric", "Pause at peak contraction", "1.5-rep method"],
    ["Drop set on last set", "Rest-pause (10+5)", "Mechanical drop set"],
    ["Double rest-pause", "Triple drop set", "21s method (7/7/7)"],
    ["Double rest-pause", "Heavy partials at top", "Slow eccentric + squeeze"],
    ["Drop set", "Rest-pause", "Slow eccentric"],
  ][phase - 1][block % 3];
}
function ex(name, sets, reps, notes) { return { exercise: name, sets, reps, notes: notes || "" }; }
function pick(table, p, b) {
  const row = table[Math.min(p - 1, table.length - 1)];
  return row[b % row.length];
}

function getWorkout(session, weekNum) {
  const p   = getPhaseNum(weekNum);
  const b   = getBlock(weekNum);
  const sr  = getSR(p);
  const t   = getTech(p, b);
  const adv = p >= 3 ? t : "";

  // ── SESSION A: Push A — Chest Focus + Shoulders + Triceps ────────────────
  // No standing barbell OHP — seated DB press only (no spinal compression)
  if (session === "A") {
    const chestComp = pick([
      ["Barbell Bench Press",        "DB Bench Press",             "Weighted Dip (assisted if needed)"],
      ["Barbell Bench Press",        "DB Bench (2-sec eccentric)", "Barbell Bench (pause at chest)"],
      ["Barbell Bench (rest-pause)", "DB Bench (drop set)",        "Barbell Bench (1.5-rep)"],
      ["Barbell Bench (heavy)",      "Close-Grip Bench Press",     "DB Bench (mechanical drop)"],
      ["Barbell Bench Press",        "DB Bench Press",             "Weighted Dip"],
    ], p, b);
    const chestInc = pick([
      ["DB Incline Press",         "Cable Incline Fly",       "Machine Incline Press"],
      ["DB Incline Press",         "DB Incline (2-sec lower)","High-to-Low Cable Fly"],
      ["DB Incline (rest-pause)",  "DB Incline (drop set)",   "DB Incline (1.5-rep)"],
      ["DB Incline (heavy)",       "Machine Incline (pause)", "Barbell Incline Press"],
      ["DB Incline Press",         "Cable Incline Fly",       "DB Incline (slow)"],
    ], p, b);
    const chestIso = pick([
      ["Pec Dec",              "Low-to-High Cable Fly",  "DB Fly"],
      ["Pec Dec (slow ecc)",   "Cable Fly (2-sec peak)", "DB Fly (pause at peak)"],
      ["Pec Dec (drop set)",   "Cable Fly (rest-pause)", "Cable Fly (1.5-rep)"],
      ["Pec Dec (triple drop)","Weighted Dip",           "Cable Crossover"],
      ["Pec Dec",              "Low-to-High Cable Fly",  "High-to-Low Cable Fly"],
    ], p, b);
    // SEATED DB press — no axial load on spine
    const ohp = pick([
      ["Seated DB Shoulder Press",        "Seated Arnold Press",          "Landmine Press"],
      ["Seated DB Shoulder Press",        "Seated Arnold Press",          "Seated DB Press (slow ecc)"],
      ["Seated DB Press (rest-pause)",    "Seated Arnold Press (pause)",  "Landmine Press (heavy)"],
      ["Seated DB Press (heavy)",         "Machine Shoulder Press",       "Landmine Press (heavy)"],
      ["Seated DB Shoulder Press",        "Seated Arnold Press",          "Machine Shoulder Press"],
    ], p, b);
    const lateral = pick([
      ["DB Lateral Raise",      "Cable Lateral Raise",      "Machine Lateral Raise"],
      ["Cable Lateral Raise",   "Lean-Away Cable Lateral",  "DB Lateral (drop set)"],
      ["Lateral (rest-pause)",  "Lateral (2-sec hold top)", "Cable Lateral (cross-body)"],
      ["Cable Lateral (heavy)", "Lateral (triple drop)",    "Lateral (1.5-rep)"],
      ["Cable Lateral Raise",   "DB Lateral Raise",         "Machine Lateral Raise"],
    ], p, b);
    const tri1 = pick([
      ["Tricep Pushdown (rope)", "EZ-Bar Skull Crusher",  "Close-Grip Bench Press"],
      ["Skull Crusher (2-sec)",  "Overhead Cable Ext.",   "Pushdown (slow)"],
      ["Pushdown (drop set)",    "Skull Crusher (drop)",  "Overhead Ext. (rest-pause)"],
      ["Weighted Dip",           "JM Press",              "Skull Crusher (heavy)"],
      ["Tricep Pushdown (rope)", "Skull Crusher",         "Overhead Cable Ext."],
    ], p, b);
    const tri2 = pick([
      ["Overhead DB Ext. (seated, single arm)", "Cable Overhead Ext.", "Tate Press"],
      ["Overhead Cable Ext. (slow)",            "Tate Press (pause)",  "DB Overhead (2-sec)"],
      ["Overhead Ext. (rest-pause)",            "Tate Press (drop)",   "Cable OH (1.5-rep)"],
      ["JM Press",                              "DB Overhead (heavy)", "Cable Overhead (heavy)"],
      ["Overhead DB Ext. (seated)",             "Cable Overhead Ext.", "Tate Press"],
    ], p, b);
    return {
      name: "Push A — Chest Focus", session: "A",
      warmup: "Band pull-aparts ×20 + rotator cuff circuit + push-up warm-up ×15 + shoulder CARs",
      note: "Chest primary — bench hard while fresh. All pressing seated or supported — no spinal load.",
      exercises: [
        ex(chestComp, sr.sets, sr.comp, adv),
        ex(chestInc,  sr.sets, sr.comp, adv),
        ex(chestIso,  "4",     sr.iso,  p >= 3 ? t : "Peak contraction focus"),
        ex(ohp,       sr.sets, sr.comp, adv),
        ex(lateral,   "4",     sr.iso,  p >= 3 ? t : ""),
        ex(tri1,      "3-4",   sr.iso,  ""),
        ex(tri2,      "3",     sr.iso,  p >= 3 ? t : "Seated — no lumbar load"),
      ]
    };
  }

  // ── SESSION B: Pull A — Back Width + Biceps ───────────────────────────────
  if (session === "B") {
    const pullComp = pick([
      ["Weighted Pull-Up",         "Lat Pulldown (wide)",    "Weighted Chin-Up"],
      ["Weighted Pull-Up",         "Lat Pulldown (neutral)", "Weighted Chin-Up"],
      ["Pull-Up (rest-pause)",     "Lat Pulldown (drop set)","Chin-Up (1.5-rep)"],
      ["Weighted Pull-Up (heavy)", "Lat Pulldown (heavy)",   "Chin-Up (heavy)"],
      ["Weighted Pull-Up",         "Lat Pulldown",           "Weighted Chin-Up"],
    ], p, b);
    // Chest-supported rows — no spinal erector loading under heavy flexion
    const rowComp = pick([
      ["Chest-Supported Row",        "Meadows Row",                  "Single-Arm DB Row (braced)"],
      ["Chest-Supported Row (slow)", "Pendlay Row",                  "Single-Arm DB Row (braced)"],
      ["CS Row (drop set)",          "Chest-Supported Row (pause)",  "SA Row (rest-pause)"],
      ["Chest-Supported Row (heavy)","Seal Row",                     "Meadows Row (heavy)"],
      ["Chest-Supported Row",        "Meadows Row",                  "Single-Arm DB Row"],
    ], p, b);
    const pullIso = pick([
      ["Cable Straight-Arm Pulldown", "Single-Arm Lat Pulldown", "Cable Pullover"],
      ["Cable Straight-Arm PD (slow)","Single-Arm LPD (slow)",   "Cable Pullover (2-sec)"],
      ["Straight-Arm PD (drop set)",  "Cable Pullover (rest-pause)","Single-Arm PD (1.5-rep)"],
      ["Cable Straight-Arm PD (heavy)","Cable Pullover (heavy)", "Single-Arm LPD (heavy)"],
      ["Cable Straight-Arm Pulldown", "Cable Pullover",          "Single-Arm Lat Pulldown"],
    ], p, b);
    const rearDelt = pick([
      ["Cable Face Pull (rope)",    "Rear Delt DB Fly",       "Cable Reverse Fly"],
      ["Cable Face Pull",           "Rear Delt DB Fly (slow)","Cable RD (2-sec hold)"],
      ["Face Pull (rest-pause)",    "Rear Delt (drop set)",   "Cable RD (1.5-rep)"],
      ["Cable Face Pull (heavy)",   "Rear Delt (triple drop)","Prone RD (weighted)"],
      ["Cable Face Pull (rope)",    "Rear Delt DB Fly",       "Cable Reverse Fly"],
    ], p, b);
    const curl1 = pick([
      ["Barbell Curl",            "EZ-Bar Curl",     "DB Curl"],
      ["Barbell Curl (2-sec)",    "Incline DB Curl", "EZ Curl (slow)"],
      ["Barbell Curl (rest-pause)","Curl (drop set)","DB Curl (1.5-rep)"],
      ["Barbell Curl (heavy)",    "EZ Curl (heavy)", "DB Curl (heavy)"],
      ["Barbell Curl",            "EZ-Bar Curl",     "Incline DB Curl"],
    ], p, b);
    const curl2 = pick([
      ["Preacher Curl (EZ)",     "Concentration Curl",  "Cable Curl"],
      ["Preacher Curl (slow)",   "Bayesian Cable Curl", "Concentration (2-sec)"],
      ["Preacher (rest-pause)",  "Bayesian (drop set)", "Preacher (1.5-rep)"],
      ["Preacher (heavy)",       "Cable Curl (heavy)",  "Bayesian (triple)"],
      ["Preacher Curl (EZ)",     "Bayesian Cable Curl", "Concentration Curl"],
    ], p, b);
    return {
      name: "Pull A — Back Width & Biceps", session: "B",
      warmup: "Band pull-aparts ×20 + face pulls ×15 + dead hangs ×30s + shoulder ext. rotation ×15",
      note: "Lat width via vertical pulls. Rows are chest-supported — protects lower back.",
      exercises: [
        ex(pullComp, sr.sets, sr.comp, adv),
        ex(rowComp,  sr.sets, sr.comp, adv),
        ex(pullIso,  "3-4",   sr.iso,  "Full lat stretch at bottom, squeeze at top"),
        ex(rearDelt, "4",     "15-20", p >= 3 ? t : "Scapular retraction focus"),
        ex("Band Pull-Apart", "3", "20-25", "Every pull session — shoulder health"),
        ex(curl1,    "4",     sr.arm,  adv),
        ex(curl2,    "3",     sr.arm,  p >= 3 ? t : ""),
      ]
    };
  }

  // ── SESSION C: Legs — NO spinal compression ───────────────────────────────
  // Leg Press, Hack Squat, Goblet Squat, Split Squat — all low/no spinal load
  // RDL is hip hinge (posterior chain tension) — NOT spinal compression
  // NO: Barbell Back Squat, Front Squat, Good Morning, Zercher Squat
  if (session === "C") {
    const quadComp = pick([
      ["Leg Press (high foot, wide)",     "Hack Squat Machine",           "Goblet Squat (heels elevated)"],
      ["Leg Press (slow eccentric)",      "Hack Squat (pause at bottom)", "Single-Leg Leg Press"],
      ["Leg Press (drop set)",            "Hack Squat (rest-pause)",      "Leg Press (rest-pause)"],
      ["Leg Press (heavy)",               "Hack Squat (heavy)",           "Single-Leg Press (heavy)"],
      ["Leg Press (high foot)",           "Hack Squat Machine",           "Goblet Squat"],
    ], p, b);
    const splitSquat = pick([
      ["DB Bulgarian Split Squat",       "Reverse Lunge (DB)",           "Step-Up (DB)"],
      ["BSS (pause at bottom)",          "Deficit Reverse Lunge (DB)",   "Step-Up (heavy DB)"],
      ["BSS (1.5-rep)",                  "BSS (slow eccentric)",         "Deficit Lunge (drop set)"],
      ["BSS (heavy DB)",                 "Walking Lunge (DB, heavy)",    "Split Squat (heavy DB)"],
      ["DB Bulgarian Split Squat",       "Reverse Lunge (DB)",           "Step-Up (DB)"],
    ], p, b);
    // RDL = hip hinge, tensile load on posterior chain — safe for low back
    const rdl = pick([
      ["DB Romanian Deadlift",           "Single-Leg DB RDL",            "Cable Pull-Through"],
      ["DB RDL (3-sec eccentric)",       "Single-Leg RDL (slow)",        "DB RDL (pause at knee)"],
      ["DB RDL (rest-pause)",            "DB RDL (drop set)",            "Single-Leg RDL (slow)"],
      ["DB RDL (heavy)",                 "Single-Leg RDL (heavy)",       "Cable RDL (heavy)"],
      ["DB Romanian Deadlift",           "Single-Leg DB RDL",            "Cable Pull-Through"],
    ], p, b);
    const legCurl = pick([
      ["Leg Curl (lying)",        "Single-Leg Curl",      "Nordic Eccentric Curl"],
      ["Leg Curl (3-sec ecc)",    "Nordic Eccentric",     "Single-Leg Curl (slow)"],
      ["Leg Curl (drop set)",     "Leg Curl (rest-pause)","Leg Curl (1.5-rep)"],
      ["Leg Curl (heavy)",        "Nordic Curl",          "GHR"],
      ["Leg Curl (lying)",        "Single-Leg Curl",      "Nordic Eccentric Curl"],
    ], p, b);
    const hipThrust = pick([
      ["Barbell Hip Thrust",          "BB Hip Thrust (2-sec pause)",    "Hip Thrust (band + BB)"],
      ["BB Hip Thrust (3-sec ecc)",   "Hip Thrust (slow + pause)",      "Single-Leg Hip Thrust"],
      ["Hip Thrust (rest-pause)",     "Hip Thrust (drop set)",          "Hip Thrust (1.5-rep)"],
      ["BB Hip Thrust (heavy)",       "Single-Leg Hip Thrust (heavy)",  "Hip Thrust (paused, heavy)"],
      ["Barbell Hip Thrust",          "BB Hip Thrust (pause)",          "Single-Leg Hip Thrust"],
    ], p, b);
    const legExt = pick([
      ["Leg Extension",             "Leg Extension (slow ecc)",   "Leg Extension (1.5-rep)"],
      ["Leg Extension (2-sec ecc)", "Leg Extension (unilateral)", "Leg Extension (pause top)"],
      ["Leg Extension (drop set)",  "Leg Extension (rest-pause)", "Leg Extension (mech drop)"],
      ["Leg Extension (heavy)",     "Leg Extension (triple drop)","Leg Extension (21s)"],
      ["Leg Extension",             "Leg Extension (slow)",       "Leg Extension (unilateral)"],
    ], p, b);
    return {
      name: "Legs — Quad / Ham / Glute / Calf", session: "C",
      warmup: "10 min bike + hip flexor stretch ×60s + banded glute bridges ×20 + leg swings ×10 each",
      note: "NO spinal compression — leg press and hack squat replace barbell squat. RDL is hip hinge (safe). Core block at end builds anti-rotation strength for disc health.",
      exercises: [
        ex(quadComp,  sr.sets, sr.comp, adv),
        ex(splitSquat,"4",     sr.comp, "DB only — no barbell on back"),
        ex(rdl,       sr.sets, sr.comp, adv),
        ex(legCurl,   sr.sets, sr.iso,  adv),
        ex(hipThrust, "4",     sr.iso,  p >= 3 ? t : "Drive hips — squeeze glute hard at top"),
        ex(legExt,    "4",     sr.iso,  p >= 3 ? t : ""),
        ex("Seated Calf Raise",   "4", "12-15", "Full ROM — 3-sec eccentric, pause at stretch"),
        ex("Standing Calf Raise", "3", "15-20", "Single-leg if possible"),
        ex("Pallof Press (cable/band)", "3", "10-12 ea", "CORE · ANTI-ROTATION — resist the twist, ribs down, brace hard. Builds disc stability."),
        ex("Half-Kneeling Cable Chop",  "3", "10-12 ea", "CORE · Controlled rotation from the T-SPINE, not lumbar. Hips stay square."),
        ex("Bird Dog",                  "3", "8-10 ea",  "CORE · Anti-extension + stability. Reach opposite arm/leg, no lower-back arch."),
        ex("Dead Bug (add DB optional)","3", "10 ea",    "CORE · Exhale fully, flatten low back into floor the entire set."),
      ]
    };
  }

  // ── SESSION D: Push B — Shoulder Focus + Chest + Triceps ─────────────────
  // Seated pressing only — no standing barbell OHP
  if (session === "D") {
    const ohpComp = pick([
      ["Seated DB Shoulder Press",       "Seated Arnold Press",         "Landmine Press"],
      ["Seated DB Press (slow ecc)",     "Seated Arnold Press",         "Machine Shoulder Press"],
      ["Seated DB Press (rest-pause)",   "Seated DB Press (drop set)",  "Landmine Press (heavy)"],
      ["Seated DB Press (heavy)",        "Machine Shoulder Press",      "Landmine Press (max)"],
      ["Seated DB Shoulder Press",       "Seated Arnold Press",         "Machine Shoulder Press"],
    ], p, b);
    const lateral2 = pick([
      ["DB Lateral Raise",      "Cable Lateral Raise",       "Machine Lateral Raise"],
      ["Lean-Away Cable Lateral","DB Lateral (drop set)",    "Cable Lateral (cross-body)"],
      ["Lateral (rest-pause)",  "Lateral (2-sec hold top)",  "Lateral (cheat + control)"],
      ["Cable Lateral (heavy)", "Lateral (triple drop)",     "Lateral (1.5-rep)"],
      ["DB Lateral Raise",      "Cable Lateral Raise",       "Machine Lateral Raise"],
    ], p, b);
    const frontDelt = pick([
      ["DB Front Raise (seated)",        "Cable Front Raise",         "Plate Front Raise"],
      ["DB Front Raise (seated, slow)",  "Cable Front (2-sec pause)", "Plate Raise (slow)"],
      ["Front Raise (rest-pause)",       "Front Raise (drop set)",    "Cable Front (1.5-rep)"],
      ["DB Front Raise (heavy)",         "Cable Front (heavy)",       "Plate Raise (heavy)"],
      ["DB Front Raise (seated)",        "Cable Front Raise",         "Plate Front Raise"],
    ], p, b);
    const chestComp2 = pick([
      ["DB Bench Press",       "Low-to-High Cable Fly",  "Pec Dec"],
      ["DB Bench (2-sec ecc)", "Pec Dec (slow)",         "Cable Fly (pause)"],
      ["DB Bench (drop set)",  "Pec Dec (rest-pause)",   "Cable Fly (1.5-rep)"],
      ["DB Bench (heavy)",     "Close-Grip Bench",       "Cable Crossover (heavy)"],
      ["DB Bench Press",       "Pec Dec",                "Low-to-High Cable Fly"],
    ], p, b);
    const rearDelt2 = pick([
      ["Rear Delt DB Fly",       "Cable Reverse Fly",     "Prone Rear Delt Fly"],
      ["Rear Delt (slow 2-sec)", "Cable RD (pause peak)", "Prone RD (weighted)"],
      ["Rear Delt (drop set)",   "Cable RD (rest-pause)", "Rear Delt (1.5-rep)"],
      ["Rear Delt (heavy)",      "Cable RD (triple drop)","Prone RD (heavy)"],
      ["Rear Delt DB Fly",       "Cable Reverse Fly",     "Rear Delt Machine"],
    ], p, b);
    const tri3 = pick([
      ["EZ-Bar Skull Crusher",     "Close-Grip Bench Press","Overhead Cable Ext."],
      ["Skull Crusher (2-sec ecc)","CG Bench (pause)",      "Cable OH (slow)"],
      ["Skull Crusher (drop set)", "CG Bench (rest-pause)", "Cable OH (1.5-rep)"],
      ["Skull Crusher (heavy)",    "Weighted Dip",          "JM Press"],
      ["EZ-Bar Skull Crusher",     "Close-Grip Bench",      "Overhead Cable Ext."],
    ], p, b);
    return {
      name: "Push B — Shoulder Focus", session: "D",
      warmup: "Band pull-aparts ×20 + rotator cuff ×15ea + lateral raise warm-up 2×15 + face pulls ×15",
      note: "Shoulder primary — all pressing seated. No standing axial load. OHP = seated DB only.",
      exercises: [
        ex(ohpComp,   sr.sets, sr.comp, adv),
        ex(lateral2,  "4",     sr.iso,  p >= 3 ? t : ""),
        ex(frontDelt, "3",     "12-15", "Seated — controlled, no swinging"),
        ex(chestComp2,"4",     sr.comp, adv),
        ex(rearDelt2, "4",     "15-20", p >= 3 ? t : "Scaps back and down"),
        ex("Cable Face Pull (rope)", "4", "15-20", "Every push session — shoulder health"),
        ex(tri3,      "3-4",   sr.iso,  p >= 3 ? t : ""),
      ]
    };
  }

  // ── SESSION E: Pull B — Back Thickness + Arm Specialization ──────────────
  if (session === "E") {
    const rowComp2 = pick([
      ["Single-Arm DB Row (braced on bench)", "Chest-Supported Row",      "Meadows Row"],
      ["Single-Arm DB Row (slow)",            "Helms Row",                "DB Seal Row"],
      ["SA Row (rest-pause)",                 "Gorilla Row",              "Chest-Supported Row (drop)"],
      ["Meadows Row (heavy)",                 "SA DB Row (heavy)",        "CS Row (slow heavy)"],
      ["Single-Arm DB Row (braced)",          "Chest-Supported Row",      "Helms Row"],
    ], p, b);
    const rowComp3 = pick([
      ["Seated Cable Row (wide)",   "Seated Cable Row (close)",  "Cable Row (high pulley)"],
      ["Cable Row (2-sec squeeze)", "Seated Row (underhand)",    "Cable Row (slow)"],
      ["Cable Row (rest-pause)",    "Cable Row (drop set)",      "Seated Row (1.5-rep)"],
      ["Cable Row (heavy)",         "Pendlay Row",               "Seal Row (heavy)"],
      ["Seated Cable Row",          "Cable Row (high pulley)",   "Chest-Supported Row"],
    ], p, b);
    const pullIso2 = pick([
      ["Lat Pulldown (neutral)",  "Single-Arm Lat Pulldown", "Cable Pullover"],
      ["LPD (underhand, slow)",   "Single-Arm PD (slow)",   "Cable Pullover (2-sec)"],
      ["LPD (drop set)",          "Straight-Arm Pulldown",  "Cable Pullover (rest-pause)"],
      ["LPD (heavy)",             "Weighted Pull-Up",        "Cable Pullover (heavy)"],
      ["Lat Pulldown (neutral)",  "Single-Arm Pulldown",    "Cable Pullover"],
    ], p, b);
    const curlSpec1 = pick([
      ["Incline DB Curl",          "Preacher Curl (EZ)",   "Cable Curl (standing)"],
      ["Incline DB Curl (slow)",   "Preacher Curl (slow)", "Bayesian Cable Curl"],
      ["Incline Curl (rest-pause)","Preacher (drop set)",  "Bayesian (1.5-rep)"],
      ["Incline Curl (heavy)",     "Preacher (heavy)",     "Barbell Drag Curl"],
      ["Incline DB Curl",          "Preacher Curl (EZ)",   "Bayesian Cable Curl"],
    ], p, b);
    const curlSpec2 = pick([
      ["Hammer Curl",          "Cross-Body Hammer Curl", "Rope Hammer Curl"],
      ["Hammer Curl (slow)",   "Cross-Body (2-sec)",     "Rope Hammer (slow)"],
      ["Hammer (rest-pause)",  "Cross-Body (drop set)",  "Rope Hammer (1.5-rep)"],
      ["Hammer Curl (heavy)",  "Cross-Body (heavy)",     "DB Reverse Curl"],
      ["Hammer Curl",          "Cross-Body Hammer Curl", "Rope Hammer Curl"],
    ], p, b);
    const curlSpec3 = pick([
      ["Concentration Curl",       "Spider Curl",         "Machine Curl"],
      ["Concentration (slow peak)","Spider Curl (slow)",  "Machine Curl (pause)"],
      ["Concentration (drop set)", "Spider (rest-pause)", "Machine (1.5-rep)"],
      ["Concentration (heavy)",    "Spider Curl (heavy)", "Machine Curl (heavy)"],
      ["Concentration Curl",       "Spider Curl",         "Machine Curl"],
    ], p, b);
    const triBurn = pick([
      ["Tricep Pushdown (rope)",  "Pushdown (bar)",        "Single-Arm Pushdown"],
      ["Pushdown (slow)",         "Pushdown (2-sec ecc)",  "Overhead Ext. (slow)"],
      ["Pushdown (drop set)",     "Pushdown (rest-pause)", "Single-Arm (1.5-rep)"],
      ["Pushdown (heavy)",        "Overhead Ext. (heavy)", "Single-Arm (heavy)"],
      ["Tricep Pushdown (rope)",  "Single-Arm Pushdown",   "Overhead Ext."],
    ], p, b);
    return {
      name: "Pull B — Thickness & Arms", session: "E",
      warmup: "Face pulls ×20 + band pull-aparts ×20 + dead hangs ×30s + bicep stretch ×30s each",
      note: "Back thickness via horizontal rows. Then full arm specialization — 3 curl variations + tri finisher.",
      exercises: [
        ex(rowComp2,  sr.sets, sr.comp, adv),
        ex(rowComp3,  sr.sets, sr.comp, adv),
        ex(pullIso2,  "3-4",   sr.iso,  "Full lat stretch, squeeze at top"),
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

// ─── PROGRESSIVE LOAD SUGGESTION ──────────────────────────────────────────────
// Scans all past logged data for the SAME base movement (ignoring rotation
// modifiers like "(drop set)", "(heavy)", "(2-sec)"), finds the most recent
// week it was logged, and suggests the next working weight.
function baseMovement(name) {
  let s = String(name).replace(/\([^)]*\)/g, " ").toLowerCase();
  s = s.replace(/\bbb\b/g, "barbell").replace(/\bdb\b/g, "dumbbell");
  s = s.replace(/\b(heavy|slow|paused|pause|tempo|drop\s*set|drop|rest-pause|restpause|mechanical|mech|triple|double|1\.5-rep|21s|eccentric|ecc|deficit|hold|explosive|max|light)\b/gi, " ");
  s = s.replace(/\b\d+(\.\d+)?[- ]?(sec|rep|reps|s)\b/gi, " ");
  s = s.replace(/[-]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}
function parseRepTarget(repStr) {
  // "10-12" -> {low:10, high:12}; "8" -> {low:8, high:8}
  const m = String(repStr).match(/(\d+)\s*-\s*(\d+)/);
  if (m) return { low: parseInt(m[1]), high: parseInt(m[2]) };
  const s = String(repStr).match(/(\d+)/);
  return s ? { low: parseInt(s[1]), high: parseInt(s[1]) } : { low: 8, high: 12 };
}

// Compound movements jump in bigger increments than isolation
function isCompoundLift(name) {
  return /Bench|Squat|Press|Row|Deadlift|RDL|Pull-Up|Chin-Up|Pulldown|Hip Thrust|Leg Press|Hack|Dip|Lunge|Split Squat|Landmine/i.test(name);
}

// Look back through weeks for the last time this exercise was logged with weight
function findLastPerformance(allWeights, exerciseName, currentWeek, sessionsGetter) {
  const targetBase = baseMovement(exerciseName);
  for (let wk = currentWeek - 1; wk >= 1; wk--) {
    for (const sess of ["A","B","C","D","E"]) {
      const wo = sessionsGetter(sess, wk);
      if (!wo) continue;
      const idx = wo.exercises.findIndex(e => baseMovement(e.exercise) === targetBase);
      if (idx === -1) continue;
      const entry = allWeights[`w${wk}_${sess}_${idx}`];
      if (!entry?.sets) continue;
      const logged = entry.sets.filter(s => s?.weight && parseFloat(s.weight) > 0);
      if (logged.length === 0) continue;
      const weightsUsed = logged.map(s => parseFloat(s.weight));
      const repsHit     = logged.map(s => parseInt(s.reps) || 0);
      return {
        week: wk,
        topWeight: Math.max(...weightsUsed),
        minReps: Math.min(...repsHit.filter(r => r > 0).length ? repsHit.filter(r => r > 0) : [0]),
        avgReps: Math.round(repsHit.reduce((a,b)=>a+b,0) / repsHit.length),
      };
    }
  }
  return null;
}

function suggestNextWeight(last, repStr, exerciseName) {
  if (!last || !last.topWeight) return null;
  const { low, high } = parseRepTarget(repStr);
  const compound = isCompoundLift(exerciseName);
  const inc = compound ? 5 : 2.5;   // lb increments
  const w = last.topWeight;

  // Hit or exceeded top of rep range on the hardest set → add weight
  if (last.minReps >= high) {
    return { weight: w + (compound ? 5 : 5), note: `Last: ${w} lb × ${last.minReps}+ (wk ${last.week}). Hit the top — add ${compound ? 5 : 5} lb.` };
  }
  // Comfortably in range → small bump
  if (last.minReps >= low) {
    return { weight: w + inc, note: `Last: ${w} lb × ${last.minReps} reps (wk ${last.week}). In range — try +${inc} lb or add a rep.` };
  }
  // Missed the bottom of range → repeat weight, chase reps
  if (last.minReps > 0) {
    return { weight: w, note: `Last: ${w} lb × ${last.minReps} reps (wk ${last.week}). Below target — repeat ${w} lb, aim for ${low}+.` };
  }
  return { weight: w, note: `Last logged ${w} lb (wk ${last.week}).` };
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
// Target rest in seconds by phase + exercise type. Compounds rest longer,
// and later/heavier phases rest longer.
function restSecondsFor(phase, exType) {
  const table = {
    1: { compound: 120, isolation: 60,  core: 45 },
    2: { compound: 90,  isolation: 60,  core: 45 },
    3: { compound: 180, isolation: 90,  core: 45 },
    4: { compound: 210, isolation: 90,  core: 60 },
    5: { compound: 120, isolation: 75,  core: 45 },
  };
  return (table[phase] || table[1])[exType] || 90;
}
function classifyExercise(name) {
  if (/Pallof|Bird Dog|Dead Bug|Cable Chop|Plank|Curl-Up|McGill/i.test(name)) return "core";
  return isCompoundLift(name) ? "compound" : "isolation";
}
function fmtTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2,"0")}` : `${sec}s`;
}
function RestTimer({ seconds, color }) {
  const [remaining, setRemaining] = useState(null); // null = not started
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && remaining > 0) {
      ref.current = setTimeout(() => setRemaining(r => r - 1), 1000);
    } else if (running && remaining === 0) {
      setRunning(false);
      try { if (navigator.vibrate) navigator.vibrate([200,100,200]); } catch {}
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) { const ac = new Ctx(); const o = ac.createOscillator(); const g = ac.createGain();
          o.connect(g); g.connect(ac.destination); o.frequency.value = 880; o.start();
          g.gain.setValueAtTime(0.15, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
          o.stop(ac.currentTime + 0.5); }
      } catch {}
    }
    return () => clearTimeout(ref.current);
  }, [running, remaining]);

  const start = () => { setRemaining(seconds); setRunning(true); };
  const stop  = () => { setRunning(false); setRemaining(null); clearTimeout(ref.current); };

  if (remaining === null) {
    return (
      <button onClick={start}
        style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${color}55`, color, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600 }}>
        ⏱ Rest {fmtTime(seconds)} — tap to start
      </button>
    );
  }
  const done = remaining === 0;
  return (
    <button onClick={stop}
      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", justifyContent:"center",
        background: done ? "#10B981" : color + "22", border:`1px solid ${done ? "#10B981" : color}`, color: done ? "#0f1117" : color,
        borderRadius:8, padding:"8px 10px", cursor:"pointer", fontSize:14, fontFamily:"inherit", fontWeight:800 }}>
      {done ? "✓ Rest done — tap to reset" : `⏱ ${fmtTime(remaining)}  ·  tap to stop`}
    </button>
  );
}

// ─── BACKUP / RESTORE ─────────────────────────────────────────────────────────
// Exports every localStorage key for this app to a downloadable JSON file.
const APP_KEY_PREFIX = "h365v2";
function exportBackup() {
  const data = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(APP_KEY_PREFIX)) data[k] = localStorage.getItem(k);
    }
  } catch {}
  const blob = new Blob([JSON.stringify({ app:"hypertrophy365v2", exported:new Date().toISOString(), data }, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hypertrophy365-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function importBackup(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const data = parsed.data || parsed;
      Object.entries(data).forEach(([k, v]) => {
        if (k.startsWith(APP_KEY_PREFIX)) localStorage.setItem(k, v);
      });
      onDone(true);
    } catch { onDone(false); }
  };
  reader.onerror = () => onDone(false);
  reader.readAsText(file);
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentWeek, setCurrentWeek] = useState(() => parseInt(LS.get("h365v2_week") || "1"));
  const [weights, setWeights]         = useState(() => LS.get("h365v2_weights")   || {});
  const [completed, setCompleted]     = useState(() => LS.get("h365v2_completed") || {});
  const [activeDay, setActiveDay]     = useState(null);
  const [view, setView]               = useState("schedule");

  const saveWeek      = (w) => { setCurrentWeek(w); LS.set("h365v2_week", w); };
  const saveWeights   = useCallback((w) => { setWeights(w);   LS.set("h365v2_weights", w);   }, []);
  const saveCompleted = useCallback((c) => { setCompleted(c); LS.set("h365v2_completed", c); }, []);

  const phaseNum = getPhaseNum(currentWeek);
  const phase    = PHASES[phaseNum - 1];
  const deload   = isDeload(currentWeek);

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
      <div style={S.header}>
        <div style={S.headerRow}>
          <div>
            <div style={S.logo}>HYPERTROPHY<span style={{ color: phase.color }}>365</span></div>
            <div style={S.sublogo}>V2 · 5-Day PPL · Max Size · Low-Back Safe</div>
          </div>
          <button onClick={() => setView("progress")} style={S.progressBtn}>📈 Progress</button>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button onClick={exportBackup} style={{ flex:1, background:"#1a1f2e", border:"1px solid #2a2f3a", color:"#9ca3af", padding:"8px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"inherit", fontWeight:600 }}>⬇ Backup my data</button>
          <label style={{ flex:1, background:"#1a1f2e", border:"1px solid #2a2f3a", color:"#9ca3af", padding:"8px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, textAlign:"center" }}>
            ⬆ Restore
            <input type="file" accept="application/json" style={{ display:"none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importBackup(f, (ok) => { if (ok) { window.location.reload(); } else { alert("Could not read that backup file."); } }); }} />
          </label>
        </div>
      </div>

      <div style={{ ...S.phaseBanner, borderColor: phase.color, background: phase.color + "18" }}>
        <div style={S.phaseBannerRow}>
          <div>
            <div style={{ ...S.phaseLabel, color: phase.color }}>PHASE {phaseNum} · WEEK {currentWeek} OF 52</div>
            <div style={S.phaseName}>{phase.name}</div>
            <div style={S.phaseFocus}>{phase.focus}</div>
          </div>
          {deload && <div style={S.deloadBadge}>🔄 DELOAD</div>}
        </div>
      </div>

      {/* Split legend */}
      <div style={S.splitRow}>
        {[
          { s:"A", label:"Push A", sub:"Chest" },
          { s:"B", label:"Pull A", sub:"Width" },
          { s:"C", label:"Legs",   sub:"Lower" },
          { s:"D", label:"Push B", sub:"Shoulders" },
          { s:"E", label:"Pull B", sub:"Arms" },
        ].map(({ s, label, sub }) => (
          <div key={s} style={S.splitCard}>
            <div style={{ ...S.splitLetter, color: "#0f1117", background: SESSION_COLORS[s] }}>{s}</div>
            <div style={{ ...S.splitLabel, color: SESSION_COLORS[s] }}>{label}</div>
            <div style={S.splitSub}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={S.weekNav}>
        <button onClick={() => saveWeek(Math.max(1, currentWeek-1))} style={{ ...S.navBtn, borderColor: phase.color }} disabled={currentWeek===1}>‹</button>
        <div style={S.weekCenter}>
          <div style={S.weekBig}>Week {currentWeek}</div>
          <div style={S.weekSub}>of 52</div>
        </div>
        <button onClick={() => saveWeek(Math.min(52, currentWeek+1))} style={{ ...S.navBtn, borderColor: phase.color }} disabled={currentWeek===52}>›</button>
      </div>

      <div style={S.dayGrid}>
        {weekDays.map(({ label, dow }) => {
          const session    = SESSION_MAP[dow];
          const isTraining = !!session;
          const key        = `w${currentWeek}_${session}`;
          const done       = completed[key];
          const color      = session ? SESSION_COLORS[session] : "#333";
          return (
            <div key={dow}
              onClick={() => { if (isTraining) { setActiveDay({ weekNum: currentWeek, session }); setView("workout"); } }}
              style={{ ...S.dayCard,
                borderColor: done ? color : isTraining ? color + "66" : "#2a2f3a",
                background:  done ? color + "25" : isTraining ? "#1a1f2e" : "#13171f",
                cursor: isTraining ? "pointer" : "default",
              }}>
              <div style={{ ...S.dayLabel, color: isTraining ? "#9ca3af" : "#4b5563" }}>{label}</div>
              {isTraining ? (<>
                <div style={{ ...S.sessionBadge, color: "#0f1117", background: SESSION_COLORS[session] }}>{session}</div>
                <div style={{ fontSize:9, color: done ? color : "#9ca3af", lineHeight:1.3, textAlign:"center", fontWeight:500 }}>
                  {SESSION_LABELS[session].split("·")[0].trim()}
                </div>
                {done && <div style={{ color, fontSize:16, fontWeight:800 }}>✓</div>}
              </>) : <div style={{ fontSize:9, color:"#374151", letterSpacing:1 }}>REST</div>}
            </div>
          );
        })}
      </div>

      {/* Phase progress bar */}
      <div style={S.phaseBar}>
        <div style={S.phaseBarLabel}>PHASE PROGRESS — TAP TO JUMP</div>
        <div style={S.phaseTrack}>
          {PHASES.map((ph, i) => {
            const wks    = ph.weeks[1] - ph.weeks[0] + 1;
            const pct    = (wks / 52) * 100;
            const active = phaseNum === i + 1;
            const past   = currentWeek > ph.weeks[1];
            return (
              <div key={i} onClick={() => saveWeek(ph.weeks[0])}
                title={`P${i+1}: ${ph.name} (Wk ${ph.weeks[0]}-${ph.weeks[1]})`}
                style={{ width:`${pct}%`, height:"100%",
                  background: past ? ph.color : active ? ph.color + "88" : "#1e2330",
                  cursor:"pointer", position:"relative", transition:"all 0.3s",
                  borderRadius: i===0 ? "4px 0 0 4px" : i===PHASES.length-1 ? "0 4px 4px 0" : 0 }}>
                {active && <div style={{ position:"absolute", inset:-2, border:`2px solid ${ph.color}`, borderRadius:4 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
          {PHASES.map((ph, i) => (
            <div key={i} onClick={() => saveWeek(ph.weeks[0])}
              style={{ fontSize:11, cursor:"pointer", fontWeight:700,
                color: phaseNum===i+1 ? ph.color : "#4b5563" }}>
              P{i+1}
            </div>
          ))}
        </div>
      </div>

      <div style={S.statsRow}>
        {[
          { label:"Sessions Done", val: Object.keys(completed).length,                  color: phase.color },
          { label:"Sets Logged",   val: Object.values(weights).reduce((a,b) => a+(Array.isArray(b?.sets) ? b.sets.filter(s=>s?.weight).length : 0), 0), color:"#FB923C" },
          { label:"Weeks Logged",  val: [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length, color:"#60A5FA" },
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
  const workout  = getWorkout(session, weekNum);
  const phaseNum = getPhaseNum(weekNum);
  const phase    = PHASES[phaseNum - 1];
  const key      = `w${weekNum}_${session}`;
  const isDone   = completed[key];
  const color    = SESSION_COLORS[session];
  const [note, setNote] = useState(() => { try { return localStorage.getItem(`h365v2_note_${key}`) || ""; } catch { return ""; } });

  const saveNote  = (v) => { setNote(v); try { localStorage.setItem(`h365v2_note_${key}`, v); } catch {} };
  const getKey    = (i) => `w${weekNum}_${session}_${i}`;
  const updateSet = (ei, si, field, value) => {
    const k    = getKey(ei);
    const prev = weights[k] || { sets: Array(8).fill(null).map(() => ({ weight:"", reps:"" })) };
    const sets = [...prev.sets];
    sets[si]   = { ...sets[si], [field]: value };
    onSaveWeights({ ...weights, [k]: { ...prev, sets } });
  };
  const getSD  = (ei, si) => weights[getKey(ei)]?.sets?.[si] || { weight:"", reps:"" };
  const nSets  = (s) => { const m = s.match(/(\d+)/); return m ? parseInt(m[1]) : 3; };
  const isBW   = (n) => ["Band Pull-Apart","Cable Face Pull","Face Pull","Bird Dog","Dead Bug","Pallof","Cable Chop"].some(k => n.includes(k));

  // Progressive-load suggestion per exercise (reads history, suggests next weight)
  const suggestionFor = (exItem) => {
    const last = findLastPerformance(weights, exItem.exercise, weekNum, getWorkout);
    return suggestNextWeight(last, exItem.reps, exItem.exercise);
  };

  if (!workout) return null;

  return (
    <div style={S.app}>
      {/* Sticky header with safe area inset */}
      <div style={{ ...S.workoutHeader, borderBottomColor: color }}>
        <button onClick={onBack} style={S.backBtn}>← Back</button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:11, letterSpacing:3, color, fontWeight:700, marginBottom:2 }}>WEEK {weekNum} · SESSION {session}</div>
          <div style={{ fontSize:17, fontWeight:800, color:"#f9fafb" }}>{workout.name}</div>
          <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>Phase {phaseNum}: {phase.name}</div>
        </div>
        {!isDone
          ? <button onClick={() => onComplete(key)} style={{ ...S.completeBtn, background: color }}>Done ✓</button>
          : <div style={{ color, fontSize:14, fontWeight:800, whiteSpace:"nowrap" }}>✓ Done</div>}
      </div>

      {deload && (
        <div style={S.deloadAlert}>
          🔄 DELOAD WEEK — Use 60-70% of your normal load. Same reps. Focus on form and recovery.
        </div>
      )}

      {/* Emphasis note */}
      <div style={{ borderLeft:`3px solid ${color}`, padding:"10px 16px", background:"#1a1f2e", margin:"0" }}>
        <div style={{ fontSize:10, letterSpacing:2, fontWeight:700, color, marginBottom:4 }}>EMPHASIS</div>
        <div style={{ fontSize:13, color:"#d1d5db", lineHeight:1.5 }}>{workout.note}</div>
      </div>

      {/* Warmup */}
      <div style={S.warmupBar}>
        <div style={S.warmupLabel}>WARM-UP</div>
        <div style={S.warmupText}>{workout.warmup}</div>
      </div>

      {/* Exercise list */}
      <div style={S.exList}>
        {workout.exercises.map((exItem, ei) => (
          <div key={ei} style={{ ...S.exCard, borderColor: isBW(exItem.exercise) ? "#2a2f3a" : "#2a2f3a" }}>
            <div style={S.exHeader}>
              <div style={{ ...S.exNum, background: color, color:"#0f1117" }}>{ei + 1}</div>
              <div style={{ flex:1 }}>
                <div style={S.exName}>{exItem.exercise}</div>
                <div style={S.exMeta}>
                  <span style={{ ...S.pill, borderColor: color, color:"#e5e7eb" }}>{exItem.sets} sets</span>
                  <span style={{ ...S.pill, borderColor: color, color:"#e5e7eb" }}>{exItem.reps} reps</span>
                  {exItem.notes && <span style={S.techPill}>{exItem.notes}</span>}
                </div>
              </div>
            </div>
            {!isBW(exItem.exercise) ? (
              <div style={S.setsGrid}>
                {(() => {
                  const sug = suggestionFor(exItem);
                  if (!sug) return null;
                  return (
                    <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0f1f18", border:"1px solid #10B98155", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
                      <span style={{ fontSize:15 }}>📈</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#34D399" }}>Suggested: {sug.weight} lb</div>
                        <div style={{ fontSize:11, color:"#9ca3af", lineHeight:1.4, marginTop:2 }}>{sug.note}</div>
                      </div>
                    </div>
                  );
                })()}
                <div style={S.setsHead}>
                  <span style={S.setHdr}>SET</span>
                  <span style={S.setHdr}>WEIGHT (lbs)</span>
                  <span style={S.setHdr}>REPS DONE</span>
                </div>
                {Array.from({ length: nSets(exItem.sets) }).map((_, si) => {
                  const sd = getSD(ei, si);
                  return (
                    <div key={si} style={S.setRow}>
                      <span style={{ ...S.setNum, color }}>{si + 1}</span>
                      <input type="number" placeholder="lbs" value={sd.weight}
                        onChange={e => updateSet(ei, si, "weight", e.target.value)}
                        style={S.wInput} inputMode="decimal" />
                      <input type="number" placeholder={exItem.reps} value={sd.reps}
                        onChange={e => updateSet(ei, si, "reps", e.target.value)}
                        style={S.rInput} inputMode="decimal" />
                    </div>
                  );
                })}
                <div style={{ marginTop:10 }}>
                  <RestTimer seconds={restSecondsFor(phaseNum, classifyExercise(exItem.exercise))} color={color} />
                </div>
              </div>
            ) : (
              <div style={S.bwNote}>
                Bodyweight / Band — log in session notes if needed
                <div style={{ marginTop:10 }}>
                  <RestTimer seconds={restSecondsFor(phaseNum, classifyExercise(exItem.exercise))} color={color} />
                </div>
              </div>
            )}
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
  const totalSets     = Object.values(weights).reduce((a,b) => a+(Array.isArray(b?.sets) ? b.sets.filter(s=>s?.weight).length : 0), 0);
  const weeksLogged   = [...new Set(Object.keys(completed).map(k=>k.split("_")[0]))].length;
  const topPhase      = PHASES[getPhaseNum(currentWeek)-1];

  const prs = {};
  Object.entries(weights).forEach(([key, data]) => {
    const parts = key.split("_");
    if (parts.length < 3) return;
    try {
      const wo = getWorkout(parts[1], parseInt(parts[0].replace("w","")));
      const e  = wo?.exercises?.[parseInt(parts[2])];
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
          <div style={{ fontSize:11, letterSpacing:3, color: topPhase.color, fontWeight:700 }}>YOUR PROGRESS</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#f9fafb" }}>Stats & PRs</div>
        </div>
        <div style={{ width:70 }} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, padding:"16px 14px 8px" }}>
        {[
          { label:"Sessions",    val:totalSessions, color:"#34D399" },
          { label:"Sets Logged", val:totalSets,     color:"#FB923C" },
          { label:"Weeks Done",  val:weeksLogged,   color:"#60A5FA" },
        ].map(({ label, val, color }) => (
          <div key={label} style={S.statCard}>
            <div style={{ ...S.statVal, color }}>{val}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={S.sectionTitle}>SESSIONS BY TYPE</div>
      <div style={{ padding:"0 14px 16px", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
        {["A","B","C","D","E"].map(s => {
          const count = Object.keys(completed).filter(k => k.includes(`_${s}`)).length;
          const color = SESSION_COLORS[s];
          return (
            <div key={s} style={{ background:"#1a1f2e", border:`2px solid ${color}44`, borderRadius:12, padding:"12px 6px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color }}>{count}</div>
              <div style={{ fontSize:11, color, fontWeight:700, marginTop:2 }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div style={S.sectionTitle}>TOP WEIGHTS LOGGED</div>
      {prList.length === 0
        ? <div style={{ textAlign:"center", color:"#4b5563", padding:"30px 0", fontSize:15 }}>No weights logged yet — start a session!</div>
        : <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:8 }}>
            {prList.map(([name, w], i) => {
              const colors = ["#F87171","#60A5FA","#34D399","#FB923C","#A78BFA"];
              const c = colors[i % colors.length];
              return (
                <div key={name} style={{ display:"flex", alignItems:"center", gap:12, background:"#1a1f2e", border:`1px solid ${c}33`, borderLeft:`4px solid ${c}`, borderRadius:"0 10px 10px 0", padding:"12px 14px" }}>
                  <div style={{ fontSize:13, color:"#6b7280", width:22, textAlign:"right", fontWeight:600 }}>{i+1}</div>
                  <div style={{ flex:1, fontSize:14, color:"#e5e7eb", fontWeight:500 }}>{name}</div>
                  <div style={{ fontSize:18, fontWeight:800, color: c }}>{w} <span style={{ color:"#6b7280", fontSize:12, fontWeight:400 }}>lbs</span></div>
                </div>
              );
            })}
          </div>
      }

      <div style={{ ...S.sectionTitle, marginTop:16 }}>PHASE COMPLETION</div>
      <div style={{ padding:"0 14px 60px", display:"flex", flexDirection:"column", gap:10 }}>
        {PHASES.map((ph, i) => {
          const sessInPhase = Object.keys(completed).filter(k => {
            const wk = parseInt(k.split("_")[0].replace("w",""));
            return wk >= ph.weeks[0] && wk <= ph.weeks[1];
          }).length;
          const maxSess = (ph.weeks[1] - ph.weeks[0] + 1) * 5;
          const pct = Math.min(100, Math.round((sessInPhase / maxSess) * 100));
          return (
            <div key={i} style={{ background:"#1a1f2e", border:`1px solid ${ph.color}33`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:10, color:"#6b7280", letterSpacing:2, fontWeight:600 }}>PHASE {i+1}</div>
                  <div style={{ fontSize:16, fontWeight:700, color: ph.color, marginTop:2 }}>{ph.name}</div>
                  <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Weeks {ph.weeks[0]}–{ph.weeks[1]}</div>
                </div>
                <div style={{ fontSize:26, fontWeight:800, color: ph.color }}>{pct}%</div>
              </div>
              <div style={{ height:6, background:"#0f1117", borderRadius:4 }}>
                <div style={{ width:`${pct}%`, height:"100%", background: ph.color, borderRadius:4, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:11, color:"#6b7280", marginTop:6 }}>{sessInPhase} / {maxSess} sessions completed</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STYLES — brighter, more readable ─────────────────────────────────────────
const S = {
  app:           { background:"#0f1117", minHeight:"100vh", color:"#f9fafb", fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, sans-serif", maxWidth:520, margin:"0 auto", paddingBottom:60 },
  header:        { padding:"20px 16px 16px", borderBottom:"1px solid #1e2330", background:"#0f1117" },
  headerRow:     { display:"flex", justifyContent:"space-between", alignItems:"center" },
  logo:          { fontSize:22, fontWeight:800, letterSpacing:2, color:"#f9fafb" },
  sublogo:       { fontSize:11, color:"#6b7280", letterSpacing:1, marginTop:3, fontWeight:500 },
  progressBtn:   { background:"#1a1f2e", border:"1px solid #374151", color:"#d1d5db", padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:14, fontFamily:"inherit", fontWeight:600 },
  phaseBanner:   { margin:"12px 14px 8px", padding:"14px 16px", borderLeft:"4px solid", borderRadius:"0 12px 12px 0" },
  phaseBannerRow:{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 },
  phaseLabel:    { fontSize:11, letterSpacing:2, fontWeight:700, marginBottom:4 },
  phaseName:     { fontSize:19, fontWeight:800, color:"#f9fafb", marginBottom:4 },
  phaseFocus:    { fontSize:12, color:"#9ca3af", lineHeight:1.5 },
  deloadBadge:   { background:"#1c1207", border:"2px solid #FB923C66", color:"#FB923C", padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:700 },
  splitRow:      { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6, padding:"8px 12px" },
  splitCard:     { background:"#1a1f2e", borderRadius:10, padding:"10px 4px", textAlign:"center" },
  splitLetter:   { fontSize:16, fontWeight:800, borderRadius:6, padding:"3px 8px", margin:"0 auto 5px", width:"fit-content" },
  splitLabel:    { fontSize:10, fontWeight:700, letterSpacing:0.5 },
  splitSub:      { fontSize:9, color:"#6b7280", marginTop:2, lineHeight:1.3 },
  weekNav:       { display:"flex", alignItems:"center", justifyContent:"center", gap:28, padding:"14px 20px" },
  navBtn:        { background:"#1a1f2e", border:"2px solid", color:"#f9fafb", width:42, height:42, borderRadius:"50%", cursor:"pointer", fontSize:20, fontFamily:"inherit", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" },
  weekCenter:    { textAlign:"center" },
  weekBig:       { fontSize:26, fontWeight:800, color:"#f9fafb" },
  weekSub:       { fontSize:13, color:"#6b7280", fontWeight:500 },
  dayGrid:       { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, padding:"0 12px 14px" },
  dayCard:       { border:"2px solid", borderRadius:12, padding:"10px 4px", textAlign:"center", transition:"all 0.15s", minHeight:92, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 },
  dayLabel:      { fontSize:9, letterSpacing:1, fontWeight:700 },
  sessionBadge:  { fontSize:15, fontWeight:800, padding:"3px 9px", borderRadius:6, letterSpacing:0.5 },
  phaseBar:      { padding:"0 14px 16px" },
  phaseBarLabel: { fontSize:10, color:"#6b7280", letterSpacing:2, marginBottom:8, fontWeight:600 },
  phaseTrack:    { display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:2 },
  statsRow:      { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, padding:"0 14px" },
  statCard:      { background:"#1a1f2e", border:"1px solid #2a2f3a", borderRadius:14, padding:"16px 10px", textAlign:"center" },
  statVal:       { fontSize:28, fontWeight:800 },
  statLabel:     { fontSize:10, color:"#6b7280", letterSpacing:1, marginTop:4, fontWeight:600 },
  sectionTitle:  { fontSize:11, color:"#6b7280", letterSpacing:2, padding:"16px 16px 8px", fontWeight:700 },
  workoutHeader: { display:"flex", alignItems:"center", gap:10, paddingTop:"calc(env(safe-area-inset-top, 0px) + 14px)", paddingBottom:"14px", paddingLeft:"16px", paddingRight:"16px", borderBottom:"2px solid", position:"sticky", top:0, background:"#0f1117", zIndex:10 },
  backBtn:       { background:"#1a1f2e", border:"1px solid #374151", color:"#d1d5db", cursor:"pointer", fontSize:14, padding:"8px 14px", borderRadius:8, fontFamily:"inherit", fontWeight:600, whiteSpace:"nowrap" },
  completeBtn:   { border:"none", color:"#0f1117", fontWeight:800, padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:13, fontFamily:"inherit", whiteSpace:"nowrap" },
  deloadAlert:   { background:"#1c1207", borderLeft:"4px solid #FB923C", color:"#FB923C", padding:"12px 16px", fontSize:13, lineHeight:1.6, fontWeight:500 },
  warmupBar:     { background:"#1a1f2e", padding:"12px 16px", borderBottom:"1px solid #2a2f3a" },
  warmupLabel:   { fontSize:10, color:"#6b7280", letterSpacing:2, fontWeight:700, marginBottom:6 },
  warmupText:    { fontSize:13, color:"#d1d5db", lineHeight:1.6 },
  exList:        { padding:"10px 12px", display:"flex", flexDirection:"column", gap:10 },
  exCard:        { background:"#1a1f2e", border:"1px solid #2a2f3a", borderRadius:14, overflow:"hidden" },
  exHeader:      { display:"flex", gap:12, padding:"14px 14px 10px", alignItems:"flex-start" },
  exNum:         { width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0, marginTop:2 },
  exName:        { fontSize:15, fontWeight:700, color:"#f9fafb", marginBottom:8, lineHeight:1.3 },
  exMeta:        { display:"flex", gap:6, flexWrap:"wrap" },
  pill:          { border:"1px solid", borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:600 },
  techPill:      { background:"#1c1207", border:"1px solid #FB923C55", borderRadius:6, padding:"3px 9px", fontSize:11, color:"#FB923C", fontWeight:600 },
  setsGrid:      { padding:"0 14px 14px" },
  setsHead:      { display:"grid", gridTemplateColumns:"28px 1fr 1fr", gap:8, marginBottom:6 },
  setHdr:        { fontSize:10, color:"#6b7280", letterSpacing:1, fontWeight:600 },
  setRow:        { display:"grid", gridTemplateColumns:"28px 1fr 1fr", gap:8, marginBottom:8, alignItems:"center" },
  setNum:        { fontSize:14, fontWeight:800, textAlign:"center" },
  wInput:        { background:"#0f1117", border:"2px solid #2a2f3a", borderRadius:8, padding:"10px 8px", color:"#f9fafb", fontSize:17, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center", fontWeight:600 },
  rInput:        { background:"#0f1117", border:"2px solid #2a2f3a", borderRadius:8, padding:"10px 8px", color:"#9ca3af", fontSize:17, fontFamily:"inherit", width:"100%", boxSizing:"border-box", textAlign:"center", fontWeight:600 },
  bwNote:        { padding:"6px 14px 14px", fontSize:12, color:"#6b7280", fontStyle:"italic" },
  noteBox:       { padding:"14px 16px" },
  noteLabel:     { fontSize:10, color:"#6b7280", letterSpacing:2, marginBottom:8, fontWeight:700 },
  noteInput:     { width:"100%", background:"#1a1f2e", border:"2px solid #2a2f3a", borderRadius:10, padding:14, color:"#d1d5db", fontSize:14, fontFamily:"inherit", resize:"vertical", minHeight:90, boxSizing:"border-box" },
};

// ─── HYPERTROPHY 365 · ATHLETE (V3.1) ───────────────────────────────────────
// 48 weeks = 12 four-week blocks. Every block: 3 loading weeks + 1 deload.
// Block order: (Hypertrophy → Strength → Power) × 4. No Foundation block.
// Spine rules: no barbell back squat, no conventional barbell deadlift.
// Allowed: barbell RDL, trap bar deadlift, overhead lunges, rotational work.
// Return-to-impact ladder (5 steps): knee scores decide when jumps and running return.
// Tests: baseline in week 1, then the deload at the end of every Power block (weeks 12, 24, 36, 48).
// Labels: A, B, C = one exercise at a time. A1/A2 = superset (ss: true marks the first of a pair).

export const BLOCK_SEQ = ["H", "S", "P", "H", "S", "P", "H", "S", "P", "H", "S", "P"];
export const TOTAL_WEEKS = BLOCK_SEQ.length * 4; // 48

export const BLOCK_INFO = {
  H: { name: "Hypertrophy", color: "#D4A64A", goal: "Build muscle. Moderate loads, more sets, reps taken close to failure." },
  S: { name: "Strength", color: "#C9483E", goal: "Heavier compound lifts for 4–6 reps with long rest. Accessories stay moderate." },
  P: { name: "Power", color: "#4FA3C7", goal: "Move fast. Explosive work first while fresh, then moderate loads lifted with maximum speed." },
};
export const DELOAD_COLOR = "#7FA58A";

// Week 1 is the baseline. The rest are the deloads that end each Power block,
// when fatigue is lowest and you're closest to peak.
export const TEST_WEEKS = [1, 12, 24, 36, 48];

export function weekInfo(w) {
  const blockIdx = Math.floor((w - 1) / 4);
  const type = BLOCK_SEQ[blockIdx];
  const wib = ((w - 1) % 4) + 1; // week in block 1–4
  const deload = wib === 4;
  const cycle = Math.floor(blockIdx / 3); // 0–3, each 12 weeks
  return { w, blockIdx, type, wib, deload, cycle, variant: cycle % 2, test: TEST_WEEKS.includes(w) };
}

// ─── RETURN-TO-IMPACT LADDER ────────────────────────────────────────────────
export const LADDER = [
  {
    name: "No impact",
    goal: "Sled pushes, heavy isometric holds, bike and rower. Nothing that lands.",
    adds: "Where you start.",
  },
  {
    name: "Loaded walking",
    goal: "Incline walking or a light ruck on the Athletic day. Still nothing that lands.",
    adds: "Athletic-day conditioning becomes an incline walk or ruck. Knee check appears on that day too.",
  },
  {
    name: "Small hops",
    goal: "A few small, quiet hops. Low height, low volume.",
    adds: "Pogo hops in the Lower A power slot, skater hops in Lower B. Leg extensions go back to normal reps.",
  },
  {
    name: "Jumps and landings",
    goal: "Box jumps, broad jumps, and lateral bounds with stuck landings.",
    adds: "Full power work on both lower days. Athletic day becomes hard incline intervals.",
  },
  {
    name: "Running",
    goal: "Run/walk intervals, then continuous easy running, then strides.",
    adds: "Athletic-day conditioning becomes a running progression that builds week by week.",
  },
];

// To move up: the last 6 knee scores since entering the step are all 2 or lower,
// and at least 3 weeks have passed. Two scores of 4+ in a row suggests a step back.
export const GATE = { sessions: 6, maxScore: 2, minWeeks: 3, flare: 4 };

const ORDER = ["A", "B", "C", "D", "E"];

export function kneeScores(log) {
  const out = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    for (const d of ORDER) {
      const v = log[`w${w}_${d}`]?.knee;
      if (v != null) out.push({ w, d, v });
    }
  }
  return out;
}

export function gateStatus(log, settings, week) {
  const { stage, stageSince } = settings;
  const scores = kneeScores(log).filter((s) => s.w >= stageSince && s.w <= week);
  let streak = 0;
  for (let i = scores.length - 1; i >= 0 && scores[i].v <= GATE.maxScore; i--) streak++;
  const weeksIn = Math.max(0, week - stageSince);
  const flare = scores.length >= 2 && scores.slice(-2).every((s) => s.v >= GATE.flare);
  return {
    stage, scores, streak, weeksIn,
    canAdvance: stage < LADDER.length - 1 && streak >= GATE.sessions && weeksIn >= GATE.minWeeks,
    shouldStepBack: stage > 0 && flare,
  };
}

// ─── PRESCRIPTIONS ──────────────────────────────────────────────────────────
const RX = {
  H: {
    power: { sets: 3, reps: "3", rest: 90 },
    main: { sets: 4, reps: "8–10", rpe: ["7", "8", "8.5"], rest: 120 },
    sec: { sets: 3, reps: "10–12", rpe: ["7.5", "8", "9"], rest: 90 },
    acc: { sets: 3, reps: "12–15", rpe: ["8", "8.5", "9"], rest: 60 },
  },
  S: {
    power: { sets: 4, reps: "3", rest: 90 },
    main: { sets: 5, reps: "4–6", rpe: ["7.5", "8", "9"], rest: 180, cue: "Heavy, but every rep clean. Leave 1–2 in the tank." },
    sec: { sets: 4, reps: "6–8", rpe: ["7.5", "8", "8.5"], rest: 120 },
    acc: { sets: 3, reps: "10–12", rpe: ["8", "8", "8.5"], rest: 75 },
  },
  P: {
    power: { sets: 5, reps: "3", rest: 120 },
    main: { sets: 4, reps: "3–5", rpe: ["7", "7", "7.5"], rest: 150, cue: "Load around 75% of your 5-rep weight. Lower under control, lift as fast as possible." },
    sec: { sets: 3, reps: "6–8", rpe: ["7.5", "8", "8"], rest: 90 },
    acc: { sets: 2, reps: "10–12", rpe: ["8", "8", "8"], rest: 60 },
  },
};

const DELOAD_RX = {
  power: { sets: 2, reps: "3", rest: 90 },
  main: { sets: 2, reps: "8", rpe: "5–6", rest: 90, cue: "Use 60–70% of last week's weight. Practice, not training." },
  sec: { sets: 2, reps: "10", rpe: "5–6", rest: 75 },
  acc: { sets: 1, reps: "12–15", rpe: "6", rest: 60 },
};

export function prescription(tier, info, poorSleep, override = {}) {
  let base;
  if (tier === "core") {
    base = { sets: info.deload ? 2 : 3, reps: "", rpe: "", rest: 45 };
  } else if (info.deload) {
    base = { ...DELOAD_RX[tier] };
  } else {
    const r = RX[info.type][tier];
    if (!r) return null;
    base = { ...r, rpe: r.rpe ? r.rpe[info.wib - 1] : "" };
  }
  if (tier === "power") base.rpe = info.deload ? "Easy, crisp" : "Max intent — stop the set if speed drops";

  const out = { ...base, ...override };
  if (info.deload && override.sets) out.sets = Math.max(1, Math.ceil(override.sets / 2));

  if (poorSleep && !info.deload && ["power", "main", "sec"].includes(tier)) {
    out.sets = Math.max(2, out.sets - 1);
    if (tier !== "power") out.rpe = "7 max";
    out.poor = true;
  }
  return out;
}

// ─── DAYS ───────────────────────────────────────────────────────────────────
export const DAYS = {
  A: { title: "Lower A", sub: "Knee-dominant legs and lower-body power", dow: 1, lower: true },
  B: { title: "Upper A", sub: "Horizontal push and pull, upper-body power", dow: 2, lower: false },
  C: { title: "Athletic", sub: "Arms, delts, carries, knee health, conditioning", dow: 3, lower: false },
  D: { title: "Lower B", sub: "Hip-dominant legs and lower-body power", dow: 4, lower: true },
  E: { title: "Upper B", sub: "Vertical push and pull, rotational power", dow: 5, lower: false },
};
export const DOW_TO_DAY = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };

// Exercise fields:
//  n: string, [variant A, variant B] (alternates by 12-week cycle), or (info) => string
//  tier: power | main | sec | acc | core
//  stages: array of overrides by impact step (power slots); finalStage = first step with the full exercise
//  low: overrides used while the impact step is below 2 (leg extension isometrics)
//  lower: true → larger load jumps; reps/sets: fixed overrides; note: coaching cue
const lungeFor = (info) => {
  if (info.type === "S") return "Step-up (DBs, knee-height box)";
  if (info.type === "P") return "Overhead reverse lunge (barbell or plate)";
  if (info.type === "H" && info.variant === 1) return "Overhead reverse lunge (barbell or plate)";
  return "Reverse lunge (DBs)";
};
const hingeFor = (info) => (info.type === "S" ? "Trap bar deadlift (high handles)" : "Barbell RDL");

const EX = {
  A: [
    {
      tier: "power", finalStage: 3,
      stages: [
        { n: "Sled push sprint, 15 yd", note: "Drive as fast as possible, walk back, repeat. No landing, so the knees only see pushing." },
        { n: "Sled push sprint, 15 yd", note: "Drive as fast as possible, walk back, repeat. No landing, so the knees only see pushing." },
        { n: "Pogo hops (low, quiet feet)", reps: "10", sets: 3, note: "Small and stiff, like a bouncing ball. Stop the set when the landings get loud." },
        { n: ["Box jump (step down)", "Seated box jump"], note: "Full reset between reps. Land softly and step down — never jump down." },
        { n: ["Box jump (step down)", "Seated box jump"], note: "Full reset between reps. Land softly and step down — never jump down." },
      ],
    },
    { tier: "main", n: ["Hack squat", "Leg press"], lower: true, note: "Depth you can own without knee pain above 3/10. Knees track over toes." },
    { tier: "sec", n: lungeFor, lower: true, repsSuffix: " /leg", note: "Drive through the whole foot. Overhead versions: hold the load with ribs down and glutes tight, and drop the weight if your lower back arches." },
    {
      tier: "acc", n: ["Leg extension (3-sec lowering)", "Leg extension (1¼ reps)"],
      low: { n: "Leg extension isometric hold", reps: "45 s hold, heavy", sets: 5, note: "Hold at about 60° of knee bend, heavy enough to feel it by 30 s. Isometrics calm an irritated patellar tendon." },
      note: "Slow and controlled. Stop short of full lockout if the knee complains.",
    },
    { tier: "acc", ss: true, n: ["Seated leg curl", "Lying leg curl"], note: "Pause one second at full contraction." },
    { tier: "acc", n: ["Seated calf raise", "Standing calf raise"], note: "Two-second stretch at the bottom." },
    { tier: "core", ss: true, n: "Pallof press", reps: "10 /side" },
    { tier: "core", n: "Dead bug", reps: "8 /side" },
  ],
  B: [
    { tier: "power", n: ["Med ball chest pass (to wall)", "Plyo push-up (hands on bench)"], reps: "4", note: "Throw or push as hard as possible. Full reset each rep." },
    { tier: "main", n: ["Barbell bench press", "DB bench press"], note: "Feet planted, shoulder blades pinned." },
    { tier: "sec", ss: true, n: ["Chest-supported T-bar row", "Seal row"], note: "Chest stays on the pad." },
    { tier: "sec", n: ["Incline DB press", "Weighted dip"], note: "Dips: stop at upper arm parallel to the floor." },
    { tier: "acc", ss: true, n: ["Face pull", "Reverse pec deck"], note: "Shoulder health — don't skip these." },
    { tier: "acc", n: ["Rope triceps pushdown", "Overhead cable triceps extension"] },
    { tier: "core", n: "Standing cable chop", reps: "10 /side" },
  ],
  C: [
    { tier: "power", n: ["Battle rope power waves", "Battle rope alternating slams"], reps: "10 s", note: "All-out for 10 seconds, rest 50." },
    { tier: "acc", ss: true, n: ["Preacher curl", "Hammer curl"], sets: 3, reps: "10–12" },
    { tier: "acc", n: ["EZ-bar skull crusher", "Dip machine"], sets: 3, reps: "10–12" },
    { tier: "acc", ss: true, n: ["Machine lateral raise", "Cable Y-raise"], sets: 3, reps: "12–15" },
    { tier: "acc", n: ["Rear delt cable fly", "Band pull-apart"], sets: 3, reps: "15–20" },
    { tier: "acc", n: ["Farmer's carry", "Trap bar carry (lift from the floor, brace first)"], sets: 4, reps: "40 yd", note: "Heavy. Tall posture, braced trunk. Job-specific grip and trunk work." },
    { tier: "acc", n: "Backward sled drag", sets: 4, reps: "30 yd", note: "Knee health: all quad, no lowering phase, very knee-friendly. Moderate weight." },
    { tier: "acc", n: ["Wrist roller", "Plate pinch hold"], sets: 3, reps: "Up and down" },
    { tier: "core", n: ["Hanging knee raise", "Side plank"], reps: "10–12 / 30 s side" },
  ],
  D: [
    {
      tier: "power", finalStage: 3,
      stages: [
        { n: "Speed hip thrust (band + light bar)", note: "Fast up, one-second squeeze, controlled down." },
        { n: "Speed hip thrust (band + light bar)", note: "Fast up, one-second squeeze, controlled down." },
        { n: "Skater hops (small, stick)", reps: "6 /side", sets: 3, note: "Short lateral hops. Stick each landing for a full second, then reset." },
        { n: ["Broad jump (stick the landing)", "Lateral bound (stick)"], note: "Stick every landing for a full second, then reset." },
        { n: ["Broad jump (stick the landing)", "Lateral bound (stick)"], note: "Stick every landing for a full second, then reset." },
      ],
    },
    { tier: "main", n: hingeFor, lower: true, note: "Hinge, don't squat. Keep the bar against your legs, brace before you pull, and reset fully on every rep. Trap bar: high handles." },
    { tier: "sec", n: ["Barbell hip thrust", "Smith machine hip thrust"], lower: true, note: "Chin tucked, ribs down. Lockout comes from glutes, not low back." },
    { tier: "sec", ss: true, n: ["DB single-leg RDL (light, controlled)", "Cable pull-through"], note: "Stop the moment your back wants to round. This is a hamstring stretch, not a lift." },
    { tier: "sec", n: ["Leg press (feet high and wide)", "Goblet box squat"], lower: true, note: "Feet high shifts work to hips and off the knees." },
    { tier: "acc", ss: true, n: ["45° back extension (bodyweight, glute bias)", "Nordic curl (eccentric only, assisted)"], note: "Pain-free range only." },
    { tier: "acc", n: ["Hip adduction machine", "Copenhagen plank (short lever)"] },
    { tier: "core", ss: true, n: "Suitcase carry", reps: "30 yd /side" },
    { tier: "core", n: "Side plank", reps: "30 s /side" },
  ],
  E: [
    { tier: "power", n: ["Standing rotational med ball throw (to wall)", "Med ball scoop toss (standing)"], reps: "4 /side", note: "Turn through the hips, then the trunk. Throw hard into a wall." },
    { tier: "main", n: ["Weighted pull-up", "Weighted chin-up"], note: "Full hang at the bottom, chest to bar at the top. Bodyweight only if the reps won't come." },
    { tier: "sec", ss: true, n: ["Seated DB shoulder press", "Half-kneeling landmine press"], note: "Back supported or kneeling — no standing barbell press." },
    { tier: "sec", n: ["Neutral-grip lat pulldown", "Single-arm lat pulldown"] },
    { tier: "acc", ss: true, n: ["Cable lateral raise", "Lean-away DB lateral raise"] },
    { tier: "acc", n: ["Incline DB curl", "EZ-bar curl"] },
    { tier: "core", ss: true, n: "Landmine rotation", reps: "8 /side" },
    { tier: "core", n: "Bird dog with 3-sec pause", reps: "6 /side" },
  ],
};

// ─── WHAT TO LOG ────────────────────────────────────────────────────────────
// Each field stores under a key: w = a load, r = reps, h = box height,
// d = jump distance, t = hold time. Load suggestions only appear for w + r.
const F = {
  w: { key: "w", label: "Weight", unit: "lb" },
  perDb: { key: "w", label: "Weight per dumbbell", unit: "lb" },
  oneDb: { key: "w", label: "Dumbbell weight", unit: "lb" },
  perHand: { key: "w", label: "Weight per hand", unit: "lb" },
  oneHand: { key: "w", label: "Weight (one hand)", unit: "lb" },
  added: { key: "w", label: "Added weight", unit: "lb" },
  bar: { key: "w", label: "Bar weight", unit: "lb" },
  onBar: { key: "w", label: "Weight on the bar", unit: "lb" },
  stack: { key: "w", label: "Stack weight", unit: "lb" },
  ball: { key: "w", label: "Ball weight", unit: "lb" },
  sled: { key: "w", label: "Sled load", unit: "lb" },
  plate: { key: "w", label: "Plate weight", unit: "lb" },
  r: { key: "r", label: "Top-set reps", unit: "reps" },
  rOnly: { key: "r", label: "Best set reps", unit: "reps" },
  rLeg: { key: "r", label: "Reps per leg", unit: "reps" },
  rArm: { key: "r", label: "Reps per arm", unit: "reps" },
  h: { key: "h", label: "Box height", unit: "in" },
  jump: { key: "d", label: "Best jump", unit: "in" },
  bound: { key: "d", label: "Best bound", unit: "in" },
  t: { key: "t", label: "Hold time", unit: "s" },
  tSide: { key: "t", label: "Hold per side", unit: "s" },
};
const DEFAULT_METRIC = [F.w, F.r];

// By exercise name. Anything not listed: weight + reps for lifts, nothing for power and core.
// reps here overrides the block prescription (for holds); suffix labels per-leg / per-arm work.
export const METRICS = {
  // power
  "Sled push sprint, 15 yd": { fields: [F.sled] },
  "Box jump (step down)": { fields: [F.h] },
  "Seated box jump": { fields: [F.h] },
  "Broad jump (stick the landing)": { fields: [F.jump] },
  "Lateral bound (stick)": { fields: [F.bound] },
  "Speed hip thrust (band + light bar)": { fields: [F.bar] },
  "Med ball chest pass (to wall)": { fields: [F.ball] },
  "Standing rotational med ball throw (to wall)": { fields: [F.ball] },
  "Med ball scoop toss (standing)": { fields: [F.ball] },
  // lower
  "Reverse lunge (DBs)": { fields: [F.perDb, F.rLeg] },
  "Step-up (DBs, knee-height box)": { fields: [F.perDb, F.rLeg] },
  "Overhead reverse lunge (barbell or plate)": { fields: [F.w, F.rLeg] },
  "Leg extension isometric hold": { fields: [F.w, F.t] },
  "DB single-leg RDL (light, controlled)": { fields: [F.oneDb, F.rLeg], suffix: " /leg" },
  "Goblet box squat": { fields: [F.oneDb, F.r] },
  "45° back extension (bodyweight, glute bias)": { fields: [F.added, F.r] },
  "Nordic curl (eccentric only, assisted)": { fields: [F.rOnly], reps: "4–6" },
  "Copenhagen plank (short lever)": { fields: [F.tSide], reps: "20–30 s /side" },
  // upper
  "DB bench press": { fields: [F.perDb, F.r] },
  "Incline DB press": { fields: [F.perDb, F.r] },
  "Weighted dip": { fields: [F.added, F.r] },
  "Weighted pull-up": { fields: [F.added, F.r] },
  "Weighted chin-up": { fields: [F.added, F.r] },
  "Seated DB shoulder press": { fields: [F.perDb, F.r] },
  "Half-kneeling landmine press": { fields: [F.onBar, F.rArm], suffix: " /arm" },
  "Single-arm lat pulldown": { fields: [F.w, F.rArm], suffix: " /arm" },
  "Lean-away DB lateral raise": { fields: [F.oneDb, F.rArm], suffix: " /arm" },
  "Hammer curl": { fields: [F.perDb, F.r] },
  "Incline DB curl": { fields: [F.perDb, F.r] },
  "Band pull-apart": { fields: [F.rOnly] },
  // athletic day
  "Farmer's carry": { fields: [F.perHand] },
  "Trap bar carry (lift from the floor, brace first)": { fields: [F.w] },
  "Backward sled drag": { fields: [F.sled] },
  "Wrist roller": { fields: [F.plate] },
  "Plate pinch hold": { fields: [F.plate, F.t], reps: "20–30 s" },
  // core
  "Pallof press": { fields: [F.stack] },
  "Standing cable chop": { fields: [F.stack] },
  "Landmine rotation": { fields: [F.onBar] },
  "Suitcase carry": { fields: [F.oneHand] },
  "Hanging knee raise": { fields: [], reps: "10–12" },
  "Side plank": { fields: [], reps: "30 s /side" },
};

function resolveName(n, info) {
  if (typeof n === "function") return n(info);
  if (Array.isArray(n)) return n[info.variant];
  return n;
}

const TIER_ORDER = { power: 0, main: 1, sec: 1, acc: 2, core: 3 };

export function exercisesFor(dayId, info, stage, { dropMain = false } = {}) {
  const list = EX[dayId]
    .filter((e) => !(dropMain && e.tier === "main")) // a lift test replaces the main lift
    .map((e) => {
      let src = e;
      let swap = false;
      if (e.stages) {
        src = { ...e, ...e.stages[Math.min(stage, e.stages.length - 1)] };
        swap = stage < e.finalStage;
      } else if (e.low && stage < 2) {
        src = { ...e, ...e.low };
        swap = true;
      }
      const name = resolveName(src.n, info);
      const spec = METRICS[name];
      const metric = spec ? spec.fields : src.tier === "power" || src.tier === "core" ? [] : DEFAULT_METRIC;
      return {
        ...src, name, swap, metric,
        reps: spec?.reps ?? src.reps,
        repsSuffix: src.repsSuffix ?? spec?.suffix,
      };
    })
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]); // stable: matches on-screen order

  // A, B, C for single lifts. A1/A2 for a superset pair (ss marks the first of the pair).
  let letter = 0;
  for (let i = 0; i < list.length; i++) {
    const L = String.fromCharCode(65 + letter++);
    if (list[i].ss && list[i + 1]) {
      list[i].label = `${L}1`; list[i].ssRole = "first";
      list[i + 1].label = `${L}2`; list[i + 1].ssRole = "second";
      i++;
    } else {
      list[i].label = L;
    }
  }
  return list;
}

// ─── WARM-UPS ───────────────────────────────────────────────────────────────
const WARM = {
  A: [
    ["Easy bike", "5 min, build to a light sweat"],
    ["90/90 hip switches", "8 /side"],
    ["Ankle rocks, knee over toe", "10 /side"],
    ["Spanish squat or wall-sit hold", "2 × 30 s — patellar tendon prep"],
    ["Band terminal knee extension", "15 /side"],
    ["Glute bridge", "12"],
  ],
  B: [
    ["Rower or ski erg", "5 min easy"],
    ["Band pull-apart", "20"],
    ["Scap push-up", "12"],
    ["Thoracic open book", "8 /side"],
    ["Band external rotation", "15 /side"],
    ["Band dislocate", "10"],
  ],
  C: [
    ["Easy bike or row", "5 min"],
    ["Arm circles into band pull-aparts", "20 each"],
    ["Wrist circles and forearm rocks", "30 s"],
    ["Lateral band walk", "15 /side"],
    ["Bird dog", "6 /side"],
  ],
  D: [
    ["Easy bike", "5 min"],
    ["Cat-cow, pain-free range", "8"],
    ["Dead bug", "6 /side"],
    ["Supported hip airplane", "5 /side"],
    ["Hamstring sweep", "8 /side"],
    ["Glute bridge with 3-sec hold", "10"],
  ],
  E: [
    ["Rower or ski erg", "5 min easy"],
    ["Dead hang", "2 × 20 s"],
    ["Wall slide", "10"],
    ["Prone Y-T-W", "6 each"],
    ["Band lat stretch", "30 s /side"],
    ["Band overhead pull-apart", "15"],
  ],
};

export function warmupFor(dayId, info, stage) {
  const list = WARM[dayId].map(([n, d]) => ({ n, d }));
  if (info.type === "P" && !info.deload) {
    if (DAYS[dayId].lower) {
      list.push(stage < 2 ? { n: "Sled march", d: "2 × 15 yd, primes the legs without landings" } : { n: "Low pogo hops", d: "2 × 10, quiet feet" });
    } else if (dayId !== "C") {
      list.push({ n: "Primer throws", d: "2 × 3 med ball throws at 70% effort" });
    }
  }
  if (dayId !== "C") list.push({ n: "Ramp-up sets", d: "3 lighter sets of the first main lift: ~50%, 70%, 85% of working weight" });
  return list;
}

// ─── COOL-DOWNS ─────────────────────────────────────────────────────────────
const COOL = {
  A: [
    ["Half-kneeling hip flexor stretch", "2 × 40 s /side"],
    ["Side-lying quad stretch", "2 × 40 s /side — easier on the knee than a couch stretch"],
    ["Wall calf stretch", "45 s /side"],
    ["Supine figure-4", "45 s /side"],
    ["Legs up the wall, slow nasal breathing", "2 min"],
  ],
  B: [
    ["Doorway pec stretch", "2 × 40 s /side"],
    ["Cross-body shoulder stretch", "40 s /side"],
    ["Overhead triceps stretch", "30 s /side"],
    ["Thread the needle", "6 /side"],
    ["Box breathing", "2 min"],
  ],
  C: [
    ["Forearm flexor and extensor stretch", "30 s each"],
    ["Doorway pec stretch", "40 s /side"],
    ["Kneeling lat stretch on bench", "40 s"],
    ["Side-lying quad stretch", "40 s /side"],
    ["90/90 breathing", "2 min"],
  ],
  D: [
    ["Supine hamstring strap stretch", "2 × 40 s /side"],
    ["Supine figure-4", "45 s /side"],
    ["Adductor rock-back", "10 /side"],
    ["Half-kneeling hip flexor stretch", "40 s /side"],
    ["Child's pose", "60 s"],
  ],
  E: [
    ["Kneeling lat stretch on bench", "2 × 40 s"],
    ["Biceps wall stretch", "30 s /side"],
    ["Upper trap stretch", "30 s /side"],
    ["Sleeper stretch", "30 s /side"],
    ["Child's pose with side reach", "30 s /side"],
  ],
};
export const cooldownFor = (dayId) => COOL[dayId].map(([n, d]) => ({ n, d }));

// ─── CONDITIONING (buy-in = before lifting, finisher = after) ───────────────
// Power blocks never use buy-ins: explosive work needs you fresh.
const MET = {
  A: {
    H: { kind: "Buy-in", title: "6-minute EMOM", work: "Odd minutes: 12/10 cal ski erg. Even minutes: 20 s battle rope waves.", note: "Hard but sustainable. It's a primer, not the workout." },
    S: { kind: "Finisher", title: "Sled push", work: "6 × 20 yd, heavy. Walk back is your rest." },
    P: { kind: "Finisher", title: "Alactic sprints", work: "8 × 8 s all-out assault bike, 52 s easy spin" },
  },
  B: {
    H: { kind: "Buy-in", title: "8-minute AMRAP", work: "10 cal bike, 20 yd sled push, 10 band pull-aparts" },
    S: { kind: "Finisher", title: "Bike intervals", work: "10 × 10 s max effort, 50 s easy" },
    P: { kind: "Finisher", title: "Sled sprints", work: "5 × 15 yd max speed, full walk-back rest" },
  },
  C: {
    H: { kind: "Finisher", title: "Aerobic base", work: "20 min Zone 2 — bike, rower, or light ruck walk" },
    S: { kind: "Finisher", title: "Tempo intervals", work: "5 rounds: 3 min moderately hard, 2 min easy (bike or rower)" },
    P: { kind: "Finisher", title: "Aerobic base", work: "20 min Zone 2 — bike, rower, or light ruck walk" },
  },
  D: {
    H: { kind: "Finisher", title: "Carry and ski", work: "4 rounds: 40 yd farmer's carry, 12 cal ski erg, rest 60 s" },
    S: { kind: "Finisher", title: "Drag and ropes", work: "5 rounds: 30 yd backward sled drag, 20 s rope waves, rest 60 s" },
    P: { kind: "Finisher", title: "Row sprints", work: "6 × 15 s hard, 45 s easy" },
  },
  E: {
    H: { kind: "Buy-in", title: "10-minute EMOM", work: "Odd minutes: 15 cal bike. Even minutes: 40 yd suitcase carry, switch hands each round." },
    S: { kind: "Finisher", title: "Ski intervals", work: "6 × 30 s hard, 60 s easy" },
    P: { kind: "Finisher", title: "Bike sprints", work: "6 × 12 s all-out, 48 s easy" },
  },
};

// Running progression for the last impact step. weeksIn = weeks since entering the step.
function runWork(weeksIn) {
  const note = "Easy means you could talk. Flat and soft if you can: grass, track, or treadmill. If the knee reaches 3/10 during or after, stop and log it.";
  if (weeksIn < 2) return { title: "Run/walk intervals", work: "6 rounds: 1 min easy jog, 1 min walk.", note };
  if (weeksIn < 4) return { title: "Longer run/walk", work: "5 rounds: 2 min easy jog, 1 min walk.", note };
  if (weeksIn < 6) return { title: "Easy run", work: "20 min continuous easy jog.", note };
  return { title: "Run with strides", work: "15 min easy jog, then 6 × 15 s strides at about 80% effort, walking 45 s between.", note };
}

export function metconFor(dayId, info, stage = 0, weeksIn = 0) {
  if (info.deload) return { kind: "Finisher", title: "Easy flush", work: "10–15 min Zone 2 on any machine. Nothing hard this week." };
  if (dayId === "C" && stage >= 1) {
    if (stage === 1) {
      return { kind: "Finisher", title: "Incline walk or ruck", work: "25 min at 8–10% incline on a treadmill, or a brisk ruck with 20–30 lb. Conversational pace.", note: "Same pack weight every time so progress is real." };
    }
    if (stage === 2) {
      return { kind: "Finisher", title: "Incline walk or ruck, hard finish", work: "30 min, with the last 5 minutes at the hardest pace you can hold without running." };
    }
    if (stage === 3) {
      return { kind: "Finisher", title: "Hill intervals, walking", work: "5 rounds: 3 min hard incline walk (10–12%), 2 min easy." };
    }
    return { kind: "Finisher", ...runWork(weeksIn) };
  }
  return MET[dayId][info.type];
}

// ─── TESTS ──────────────────────────────────────────────────────────────────
// better: "up" (higher is better), "down" (lower is better), null (just track it)
export const TESTS = [
  { id: "leg", replacesMain: true, name: "Leg press, 5-rep max", unit: "lb", kind: "num", better: "up", day: "A",
    how: "Same foot position and depth every test. Work up to the heaviest set of 5 clean reps where you could have done at most 1 more. Skip it if the knee is above 3/10." },
  { id: "bench", replacesMain: true, name: "Bench press, 5-rep max", unit: "lb", kind: "num", better: "up", day: "B",
    how: "Use a spotter or safeties. Work up to the heaviest set of 5 clean reps, with at most 1 more in the tank." },
  { id: "row", name: "500 m row", unit: "m:ss", kind: "time", better: "down", day: "C",
    how: "Same damper setting every test. Warm up, then one all-out 500 m. Log the time." },
  { id: "tdl", replacesMain: true, name: "Trap bar deadlift, 5-rep max", unit: "lb", kind: "num", better: "up", day: "D",
    how: "High handles, brace before every pull, reset fully each rep. Stop the set if your back rounds. Heaviest clean 5 with at most 1 more in the tank." },
  { id: "pull", replacesMain: true, name: "Pull-ups, max reps", unit: "reps", kind: "num", better: "up", day: "E",
    how: "Bodyweight only. Full hang to chin over bar, no kipping. Stop at the first rep that breaks form." },
  { id: "ruck", name: "2-mile ruck", unit: "m:ss", kind: "time", better: "down", day: "SAT",
    how: "Saturday. Flat route or treadmill at 0%, walking only. Same pack weight every test." },
  { id: "ruckLb", name: "Ruck pack weight", unit: "lb", kind: "num", better: null, day: "SAT",
    how: "Weigh the pack and log it so the ruck times compare fairly." },
  { id: "bw", name: "Body weight", unit: "lb", kind: "num", better: null, day: "ANY",
    how: "Morning, after the bathroom, before food. Average 3 mornings that week if you can." },
  { id: "waist", name: "Waist at navel", unit: "in", kind: "num", better: null, day: "ANY",
    how: "Relaxed, tape level at the navel, same spot every time. Strength up with waist flat is the recomposition you want." },
];

export function parseTime(s) {
  if (s == null) return null;
  const str = String(s).trim();
  if (!str) return null;
  const m = str.match(/^(\d+):([0-5]?\d(?:\.\d+)?)$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}
export function fmtTime(sec) {
  const total = Math.round(sec);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// ─── LOAD SUGGESTION ────────────────────────────────────────────────────────
export function repRange(reps) {
  if (!reps) return null;
  const m = String(reps).match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2])];
  const s = String(reps).match(/^(\d+)(\s|$)/);
  if (s) return [Number(s[1]), Number(s[1])];
  return null;
}

export function suggestLoad(last, reps, lower) {
  if (!last || !last.w) return null;
  const range = repRange(reps);
  const w = Number(last.w);
  const r = Number(last.r);
  if (!range || !w) return null;
  const step = lower ? 10 : 5;
  if (r >= range[1]) return `Try ${w + step} lb`;
  if (r && r < range[0]) return `Hold ${w} lb or drop 5–10%`;
  return `Stay at ${w} lb, add a rep`;
}

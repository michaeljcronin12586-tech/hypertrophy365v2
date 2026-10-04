# Hypertrophy 365 · Athlete edition (V3.2)

48-week athlete program: Hypertrophy → Strength → Power blocks × 4, each 3 loading weeks
+ 1 deload. No Foundation block. Warm-ups, cool-downs, buy-ins and finishers built in.

## What changed in 3.2
- **Foundation removed.** The program starts at Hypertrophy in week 1 and runs 48 weeks.
- **Logging fields match the exercise.** Box jumps log box height (in), broad jumps and bounds
  log distance (in), med ball work logs ball weight, sleds log sled load, holds log seconds,
  weighted pull-ups and dips log added weight, dumbbell and single-leg work say per dumbbell / per leg.
  Exercises with nothing worth logging (pogo hops, battle ropes, dead bugs) show no fields.
- **Tests moved.** Baseline in week 1, then weeks 12, 24, 36, 48. Each lift test replaces that day's main lift.

## What changed in 3.1
- **Impact steps.** Five steps from "No impact" to "Running". Your knee scores decide when
  jumps, landings, and running come back. The app never moves you up on its own.
- **Test log.** Added (schedule updated in 3.2).
- **Exercise labels.** A, B, C are single lifts done one at a time. A1/A2 is a superset:
  one set of A1, straight to A2, then rest. The rest timer starts after the second exercise only.
- **Spine rules updated.** No barbell back squat or conventional barbell deadlift.
  Barbell RDL (Hypertrophy and Power blocks), trap bar deadlift (Strength blocks),
  overhead reverse lunges, and rotational work are in.

## Deploy (same URL keeps your data)
1. Open the current app, Settings, Export backup, and save it to Files.
2. Unzip this project.
3. In your GitHub repo for this app, replace the files with these and commit.
4. Vercel redeploys on its own. Keep the same Vercel URL so your logs carry over.
   (Storage keys are unchanged. An old "knee mode on" save becomes impact step 1.
   Week numbers now mean different blocks, so if you logged weeks under 3.1, start over at week 1.)
5. New project instead? Vercel → Add New → Project → import → Deploy, then Safari → Share →
   Add to Home Screen, and restore your backup in Settings.

## Files
- src/program.js: all training content, impact steps, gate rules, tests
- src/App.jsx: the app
- src/index.css: styling

## Storage keys
h365v3_week, h365v3_log, h365v3_settings, h365v3_tests
